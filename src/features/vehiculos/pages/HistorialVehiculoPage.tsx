import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import PageLayout from "../../../components/layout/PageLayout";
import MainLayout from "../../../components/layout/MainLayout";
import BreadcrumbsMenu from "../../../components/ui/BreadcrumbsMenu";
import { formatDateHours } from "../../../app/hooks/dataParse";
import type { Acarreo } from "../../../types/Acarreo";
import { obtenerAcarreosPorPatente } from "../services/vehiculosService";

/** Fila "etiqueta / valor" del historial, con el diseño del móvil. */
function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between items-start gap-3 text-xs">
      <span className="font-bold text-cerulean-700 whitespace-nowrap">
        {etiqueta}:
      </span>
      <span className="text-cerulean-900 text-right break-words">{valor}</span>
    </div>
  );
}

/**
 * Historial de acarreos de un vehículo. Pensada como página (no modal) para
 * que la puedan abrir los playeros, cajeros y supervisores desde el buscador
 * por patente, replicando la pantalla del móvil.
 */
export default function HistorialVehiculoPage() {
  const { patente = "" } = useParams<{ patente: string }>();
  const { token } = useSelector((state: RootState) => state.auth);

  const [acarreos, setAcarreos] = useState<Acarreo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !patente) return;

    let activo = true;

    const cargar = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await obtenerAcarreosPorPatente(token, patente);
        if (activo) setAcarreos(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (activo) {
          setError(
            err.response?.data?.message ||
              "No se pudo cargar el historial. Intenta nuevamente más tarde.",
          );
        }
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [token, patente]);

  return (
    <PageLayout>
      <MainLayout>
        <aside className="w-full p-4 text-sm">
          <BreadcrumbsMenu
            page={patente ? `Historial ${patente}` : "Historial"}
            links={[{ name: "Vehículos", href: "/vehiculos" }]}
          />
        </aside>

        <main className="flex flex-col justify-start items-center py-4 px-4 w-full">
          <section className="w-full max-w-3xl flex flex-col gap-4">
            <h1 className="text-lg font-bold uppercase">
              Historial de {patente}
            </h1>

            {loading && (
              <p className="text-sm text-cerulean-700">Cargando...</p>
            )}

            {!loading && error && (
              <p className="text-sm text-scarlet-rush-700">{error}</p>
            )}

            {!loading && !error && acarreos.length === 0 && (
              <p className="text-sm text-cerulean-700">
                Sin acarreos registrados.
              </p>
            )}

            {acarreos.map((acarreo, index) => {
              const grua = acarreo.Turno_Grua?.Grua;
              const sucursal = grua?.Sucursal?.nombre;
              const chofer = acarreo.Turno_Grua?.chofer;
              const enganchador = acarreo.Turno_Grua?.enganchador;

              return (
                <article
                  key={acarreo.id ?? index}
                  className="rounded-lg bg-cerulean-100 shadow p-4 flex flex-col gap-1"
                >
                  <div className="flex justify-between items-center gap-2 border-b border-cerulean-200 pb-2 mb-1">
                    <span className="font-bold text-cerulean-900">
                      {formatDateHours(acarreo.fecha_acarreo)}
                    </span>
                    <span className="text-xs font-semibold text-cerulean-700">
                      Sucursal: {sucursal ?? "-"}
                    </span>
                  </div>

                  <Fila
                    etiqueta="Grúa"
                    valor={
                      grua
                        ? `${grua.patente}${
                            grua.numero ? ` (N° ${grua.numero})` : ""
                          }`
                        : "-"
                    }
                  />
                  <Fila etiqueta="Dirección" valor={acarreo.direccion || "-"} />
                  <Fila etiqueta="Motivo" valor={acarreo.motivo || "-"} />
                  <Fila
                    etiqueta="N° de acta"
                    valor={acarreo.numero_acta ? String(acarreo.numero_acta) : "Sin acta"}
                  />
                  <Fila etiqueta="Estado" valor={acarreo.estado ?? "-"} />
                  <Fila
                    etiqueta="Gruero (chofer)"
                    valor={
                      chofer ? `${chofer.nombre} ${chofer.apellido}`.trim() : "-"
                    }
                  />
                  <Fila
                    etiqueta="Enganchador"
                    valor={
                      enganchador
                        ? `${enganchador.nombre} ${enganchador.apellido}`.trim()
                        : "-"
                    }
                  />
                  <Fila
                    etiqueta="Agente"
                    valor={acarreo.Turno_Grua?.nombre_agente || "-"}
                  />
                  <Fila
                    etiqueta="Ingreso a playa"
                    valor={
                      acarreo.fecha_ingreso
                        ? formatDateHours(acarreo.fecha_ingreso)
                        : "No registrado"
                    }
                  />
                  <Fila
                    etiqueta="Egreso de playa"
                    valor={
                      acarreo.fecha_egreso
                        ? formatDateHours(acarreo.fecha_egreso)
                        : "No registrado"
                    }
                  />
                  {acarreo.observaciones ? (
                    <Fila
                      etiqueta="Observaciones"
                      valor={acarreo.observaciones}
                    />
                  ) : null}
                  {acarreo.incidencias ? (
                    <Fila etiqueta="Incidencias" valor={acarreo.incidencias} />
                  ) : null}
                </article>
              );
            })}
          </section>
        </main>
      </MainLayout>
    </PageLayout>
  );
}
