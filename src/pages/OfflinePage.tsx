import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "../app/store";
import PageLayout from "../components/layout/PageLayout";
import MainLayout from "../components/layout/MainLayout";
import BreadcrumbsMenu from "../components/ui/BreadcrumbsMenu";
import CallToActionButton from "../components/ui/CallToActionButton";
import ChoiceModal from "../components/ui/ChoiceModal";
import { formatDateFullWithHs } from "../app/hooks/dataParse";
import { listarOutbox } from "../app/offline/db";
import {
  descartarOperacion,
  reintentarOperacion,
  suscribirOutbox,
} from "../app/offline/outbox";
import { sincronizarAhora } from "../app/offline/sync";
import type { OutboxItem, OutboxTipo } from "../app/offline/types";

const TIPO_LABEL: Record<OutboxTipo, string> = {
  ACARREO: "Alta de acarreo",
  INGRESO: "Ingreso a playa",
  EGRESO: "Egreso de playa",
  SIN_CARGO: "Salida sin cargo",
  INCIDENCIA_ACARREO: "Incidencia de acarreo",
  COBRO: "Cobro",
  TURNO_CAJA_INICIO: "Inicio de turno de caja",
  TURNO_CAJA_CIERRE: "Cierre de turno de caja",
  INCIDENCIA_TURNO_CAJA: "Incidencia de turno de caja",
};

const resumenItem = (item: OutboxItem): string => {
  if (item.recurso?.tipo === "ACARREO") {
    return `Patente ${item.recurso.patente}`;
  }
  if (item.recurso?.tipo === "TURNO_CAJA") {
    return `Turno de caja ${item.recurso.id.slice(0, 8)}`;
  }

  const body = (item.body ?? {}) as Record<string, unknown>;
  const vehiculo = body.vehiculo as { patente?: string } | undefined;

  if (vehiculo?.patente) return `Patente ${vehiculo.patente}`;

  const idAcarreo = body.id_acarreo;
  if (typeof idAcarreo === "string" && idAcarreo) {
    return `Acarreo ${idAcarreo.slice(0, 8)}`;
  }

  return item.ruta;
};

const estadoClase = (estado: OutboxItem["estado"]) => {
  if (estado === "CONFLICTO") return "bg-scarlet-rush-600 text-white";
  if (estado === "ENVIANDO") return "bg-cerulean-600 text-white";
  return "bg-amber-500 text-white";
};

export default function OfflinePage() {
  const { usuario, sessionExpired } = useSelector(
    (state: RootState) => state.auth,
  );
  const { browserOnline, apiStatus, sincronizando, pendientes, conflictos } =
    useSelector((state: RootState) => state.offline);

  const [items, setItems] = useState<OutboxItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [aDescartar, setADescartar] = useState<OutboxItem | null>(null);
  const [procesando, setProcesando] = useState(false);

  const cargar = useCallback(async () => {
    if (!usuario) {
      setItems([]);
      setCargando(false);
      return;
    }

    setItems(await listarOutbox(usuario.id));
    setCargando(false);
  }, [usuario]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
    return suscribirOutbox(() => {
      void cargar();
    });
  }, [cargar]);

  // Los contadores del store cambian cuando termina un flush; se refresca la
  // lista para reflejar lo que quedó pendiente o en conflicto.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar, sincronizando, pendientes, conflictos]);

  const sincronizar = async () => {
    setProcesando(true);
    try {
      await sincronizarAhora("manual");
      await cargar();
    } finally {
      setProcesando(false);
    }
  };

  const reintentar = async (item: OutboxItem) => {
    setProcesando(true);
    try {
      await reintentarOperacion(item.id);
      await sincronizarAhora("manual");
      await cargar();
    } finally {
      setProcesando(false);
    }
  };

  const confirmarDescarte = async () => {
    if (!aDescartar) return;

    setProcesando(true);
    try {
      await descartarOperacion(aDescartar.id);
      setADescartar(null);
      await cargar();
    } finally {
      setProcesando(false);
    }
  };

  const sinRed = !browserOnline || apiStatus === "down";
  const puedeSincronizar = !sinRed && !sessionExpired && !sincronizando;

  return (
    <PageLayout>
      <MainLayout>
        <aside className="w-full p-4 text-sm">
          <BreadcrumbsMenu page="Cola offline" />
        </aside>

        <main className="flex flex-col justify-start items-center py-4 px-4 w-full">
          <section className="w-full max-w-6xl bg-cerulean-100 rounded shadow p-4 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h1 className="text-lg font-bold uppercase">
                  Operaciones sin sincronizar
                </h1>
                <p className="text-xs text-cerulean-800">
                  {sinRed
                    ? "Sin conexión con la API: los cambios quedan guardados y se envían solos al reconectar."
                    : sessionExpired
                      ? "La sesión venció: volvé a iniciar sesión para enviar los cambios."
                      : "Los cambios se envían automáticamente. También podés forzar el envío ahora."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {sessionExpired && (
                  <Link
                    to="/login"
                    className="bg-scarlet-rush-600 text-white uppercase px-4 py-2 rounded text-xs hover:bg-scarlet-rush-700 transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                )}
                <CallToActionButton
                  type="button"
                  handleSubmit={sincronizar}
                  disabled={!puedeSincronizar || procesando}
                >
                  {sincronizando || procesando
                    ? "Sincronizando..."
                    : "Sincronizar ahora"}
                </CallToActionButton>
              </div>
            </div>

            {conflictos > 0 && (
              <p className="text-xs text-scarlet-rush-700 bg-scarlet-rush-100 rounded p-2">
                {conflictos} operación(es) quedaron en conflicto porque el
                estado o el importe no coinciden con el servidor. Revisalas
                antes de reintentar o descartarlas.
              </p>
            )}
          </section>

          <section className="w-full max-w-6xl mt-4 flex flex-col gap-3">
            {cargando && (
              <p className="text-xs text-cerulean-800">Cargando cola...</p>
            )}

            {!cargando && items.length === 0 && (
              <div className="bg-cerulean-100 rounded shadow p-4 text-sm text-cerulean-800">
                No hay operaciones pendientes. Todo lo registrado en este
                dispositivo está sincronizado.
              </div>
            )}

            {items.map((item) => (
              <article
                key={item.id}
                className="bg-cerulean-100 rounded shadow p-4 flex flex-col gap-2"
              >
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <h2 className="font-bold text-sm">
                      {TIPO_LABEL[item.tipo]}
                    </h2>
                    <p className="text-xs text-cerulean-800">
                      {resumenItem(item)}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${estadoClase(item.estado)}`}
                  >
                    {item.estado}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-cerulean-900">
                  <p>
                    <span className="font-bold">Registrada:</span>{" "}
                    {formatDateFullWithHs(item.creadoEn)}
                  </p>
                  <p>
                    <span className="font-bold">Intentos:</span> {item.intentos}
                  </p>
                  {item.proximoIntentoEn && (
                    <p>
                      <span className="font-bold">Próximo intento:</span>{" "}
                      {formatDateFullWithHs(
                        new Date(item.proximoIntentoEn).toISOString(),
                      )}
                    </p>
                  )}
                  {item.ultimoError && (
                    <p className="sm:col-span-2 text-scarlet-rush-700">
                      <span className="font-bold">Último error:</span>{" "}
                      {item.ultimoError}
                    </p>
                  )}
                  {item.conflicto && (
                    <p className="sm:col-span-2 text-scarlet-rush-700">
                      <span className="font-bold">Conflicto:</span>{" "}
                      {item.conflicto.message}
                      {item.conflicto.code
                        ? ` (${item.conflicto.code})`
                        : ""}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {item.estado === "CONFLICTO" && (
                    <CallToActionButton
                      type="button"
                      handleSubmit={() => reintentar(item)}
                      disabled={procesando}
                    >
                      Reintentar
                    </CallToActionButton>
                  )}
                  <button
                    type="button"
                    onClick={() => setADescartar(item)}
                    disabled={procesando}
                    className="text-xs uppercase font-bold text-scarlet-rush-700 hover:text-scarlet-rush-900 disabled:opacity-50 cursor-pointer"
                  >
                    Descartar
                  </button>
                </div>
              </article>
            ))}
          </section>
        </main>

        <ChoiceModal
          open={aDescartar !== null}
          setOpen={(open) => {
            if (!open) setADescartar(null);
          }}
          title="Descartar operación"
          subtitle="Se va a borrar de este dispositivo sin enviarla al servidor. Esta acción no se puede deshacer."
          disabled={procesando}
          confirm={confirmarDescarte}
          cancel={() => setADescartar(null)}
        />
      </MainLayout>
    </PageLayout>
  );
}
