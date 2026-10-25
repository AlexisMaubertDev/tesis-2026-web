import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../../../app/store";
import { showError } from "../../../app/store/snackbarSlice";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import { formatCurrency } from "../../../app/utils/money";
import MainLayout from "../../../components/layout/MainLayout";
import PageLayout from "../../../components/layout/PageLayout";
import BreadcrumbsMenu from "../../../components/ui/BreadcrumbsMenu";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import type {
  Informe,
  InformeAcarreos,
  InformeCobros,
  InformeMovimientos,
  MovimientoInforme,
  PlayeroInforme,
} from "../../../types/Informe";
import GenerarInformeModal from "../components/GenerarInformeModal";
import InformeAcarreosTable from "../components/InformeAcarreosTable";
import InformeCobrosTable from "../components/InformeCobrosTable";
import InformeFinTurnoCard from "../components/InformeFinTurnoCard";
import InformeTable from "../components/InformeTable";
import { abrirInformePdf } from "../services/informesService";

const dosDigitos = (valor: number) => String(valor).padStart(2, "0");

/** Fecha local `AAAA-MM-DD` de un instante ISO devuelto por el servidor. */
const fechaLocal = (iso: string) => {
  const fecha = new Date(iso);
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
};

/** Hora local `HH:mm` de un instante ISO devuelto por el servidor. */
const horaLocal = (iso: string) => {
  const fecha = new Date(iso);
  return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
};

/**
 * Agrupa los playeros por turno de barrera (mismo turno/igual asignación)
 * para mostrarlos fuera de la tabla, ya que suelen ser los mismos para todo
 * el informe cuando abarca uno o varios turnos.
 */
const agruparTurnosBarrera = (informe: InformeMovimientos) => {
  const mapa = new Map<
    string,
    { turno: NonNullable<MovimientoInforme["turno_barrera"]>; playeros: PlayeroInforme[] }
  >();

  informe.movimientos.forEach((movimiento) => {
    if (!movimiento.turno_barrera) return;

    const clave = movimiento.turno_barrera.id;
    if (mapa.has(clave)) return;

    mapa.set(clave, {
      turno: movimiento.turno_barrera,
      playeros: movimiento.playeros ?? [],
    });
  });

  return Array.from(mapa.values()).sort((a, b) => {
    const fa = a.turno?.fecha_inicio ?? "";
    const fb = b.turno?.fecha_inicio ?? "";
    return fa.localeCompare(fb);
  });
};

export default function InformesPage() {
  const { usuario, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [informe, setInforme] = useState<Informe | null>(null);
  const [generandoPdf, setGenerandoPdf] = useState(false);

  const esMovimientos = informe?.tipo === "ENTRADA" || informe?.tipo === "SALIDA";
  const informeMovimientos = esMovimientos
    ? (informe as InformeMovimientos)
    : null;
  const informeCobros = informe?.tipo === "COBRO" ? (informe as InformeCobros) : null;
  const informeAcarreos =
    informe?.tipo === "ACARREO" ? (informe as InformeAcarreos) : null;

  const turnosBarrera = useMemo(
    () => (informeMovimientos ? agruparTurnosBarrera(informeMovimientos) : []),
    [informeMovimientos],
  );

  // El informe de cobros (RF21) lo ven Cajero, Supervisor y Sistemas.
  const puedeVerCobros =
    usuario?.rol === "CAJERO" ||
    usuario?.rol === "SUPERVISOR" ||
    usuario?.rol === "SISTEMAS";

  // El informe detallado de fin de turno es sólo para supervisor y sistemas.
  const puedeVerFinTurno =
    usuario?.rol === "SUPERVISOR" || usuario?.rol === "SISTEMAS";

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  const handleGenerarPdf = async () => {
    if (!token || !informe) return;

    setGenerandoPdf(true);

    try {
      await abrirInformePdf(token, {
        tipo: informe.tipo,
        modo: informe.modo,
        desde:
          informe.modo === "RANGO"
            ? fechaLocal(informe.periodo.desde)
            : undefined,
        hasta:
          informe.modo === "RANGO"
            ? fechaLocal(informe.periodo.hasta)
            : undefined,
        desdeHora:
          informe.modo === "RANGO"
            ? horaLocal(informe.periodo.desde)
            : undefined,
        hastaHora:
          informe.modo === "RANGO"
            ? horaLocal(informe.periodo.hasta)
            : undefined,
        // Conserva el filtro de sucursal elegido por Sistemas al generar el
        // informe, para que el PDF muestre exactamente lo mismo que la tabla.
        sucursal: informe.sucursal.id ? informe.sucursal.nombre : undefined,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      dispatch(
        showError(
          error.response?.data?.message ||
            "No se pudo generar el PDF del informe. Intentá nuevamente.",
        ),
      );
    } finally {
      setGenerandoPdf(false);
    }
  };

  return (
    <PageLayout>
      <MainLayout>
        <aside className="w-full p-4 text-sm">
          <BreadcrumbsMenu page="Informes" />
        </aside>

        <main className="flex flex-col w-full max-w-7xl mx-auto py-4 px-4">
          <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full bg-cerulean-100 rounded shadow p-4 gap-4">
            <h1 className="sm:text-lg font-bold uppercase self-center">
              Informes
            </h1>

            <div className="flex flex-col sm:flex-row gap-3">
              <CallToActionButton
                type="button"
                handleSubmit={() => setModalAbierto(true)}
              >
                Generar informe
              </CallToActionButton>

              <CallToActionButton
                type="button"
                handleSubmit={handleGenerarPdf}
                disabled={!informe || generandoPdf}
              >
                {generandoPdf ? "Generando PDF..." : "Generar PDF"}
              </CallToActionButton>
            </div>
          </section>

          {puedeVerFinTurno && (
            <InformeFinTurnoCard
              token={token}
              esSistemas={usuario.rol === "SISTEMAS"}
            />
          )}

          {informeMovimientos && (
            <>
              <section className="w-full mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="rounded-lg bg-cerulean-100 shadow p-3">
                  <p className="text-[10px] font-bold uppercase text-cerulean-700">
                    Tipo de informe
                  </p>
                  <p className="text-sm font-bold">{informeMovimientos.titulo}</p>
                </div>
                <div className="rounded-lg bg-cerulean-100 shadow p-3">
                  <p className="text-[10px] font-bold uppercase text-cerulean-700">
                    Período
                  </p>
                  <p className="text-sm font-bold">
                    {informeMovimientos.periodo.descripcion}
                  </p>
                  <p className="text-[10px] text-cerulean-700">
                    {formatDateFullWithHs(informeMovimientos.periodo.desde)} →{" "}
                    {formatDateFullWithHs(informeMovimientos.periodo.hasta)}
                  </p>
                </div>
                <div className="rounded-lg bg-cerulean-100 shadow p-3">
                  <p className="text-[10px] font-bold uppercase text-cerulean-700">
                    Vehículos
                  </p>
                  <p className="text-sm font-bold">
                    {informeMovimientos.totales.cantidad}
                  </p>
                </div>
              </section>

              {turnosBarrera.length > 0 && (
                <section className="w-full mt-4 rounded-lg bg-cerulean-100 shadow p-4 flex flex-col gap-3">
                  <h2 className="text-sm font-bold uppercase">
                    Turnos de barrera y playeros
                  </h2>
                  <div className="flex flex-col gap-2">
                    {turnosBarrera.map((item) => (
                      <div
                        key={item.turno.id}
                        className="rounded-lg bg-cerulean-50 p-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <p className="text-xs font-bold">
                            Barrera:{" "}
                            {informeMovimientos.movimientos.find(
                              (m) => m.turno_barrera?.id === item.turno.id,
                            )?.barrera ?? "-"}{" "}
                            · Turno: {item.turno.turno}
                          </p>
                          <p className="text-[10px] text-cerulean-700">
                            {formatDateFullWithHs(item.turno.fecha_inicio)}{" "}
                            {item.turno.fecha_fin
                              ? `→ ${formatDateFullWithHs(item.turno.fecha_fin)}`
                              : "(turno abierto)"}
                          </p>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(item.playeros ?? []).length > 0 ? (
                            item.playeros.map((playero) => (
                              <span
                                key={playero.id}
                                className="rounded-full bg-cerulean-600 px-2 py-1 text-[10px] text-white"
                              >
                                {playero.nombre_completo ||
                                  [playero.nombre, playero.apellido]
                                    .filter(Boolean)
                                    .join(" ")}
                                {playero.legajo
                                  ? ` · Legajo ${playero.legajo}`
                                  : ""}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-cerulean-700">
                              Sin playeros asignados registrados.
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="w-full mt-4">
                <InformeTable
                  movimientos={informeMovimientos.movimientos}
                  etiquetaFecha={informeMovimientos.etiquetaFecha}
                />
              </section>
            </>
          )}

          {informeCobros && (
            <>
              <section className="w-full mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-lg bg-cerulean-100 shadow p-3">
                  <p className="text-[10px] font-bold uppercase text-cerulean-700">
                    Tipo de informe
                  </p>
                  <p className="text-sm font-bold">{informeCobros.titulo}</p>
                </div>
                <div className="rounded-lg bg-cerulean-100 shadow p-3">
                  <p className="text-[10px] font-bold uppercase text-cerulean-700">
                    Período
                  </p>
                  <p className="text-sm font-bold">
                    {informeCobros.periodo.descripcion}
                  </p>
                  <p className="text-[10px] text-cerulean-700">
                    {formatDateFullWithHs(informeCobros.periodo.desde)} →{" "}
                    {formatDateFullWithHs(informeCobros.periodo.hasta)}
                  </p>
                </div>
                <div className="rounded-lg bg-cerulean-100 shadow p-3">
                  <p className="text-[10px] font-bold uppercase text-cerulean-700">
                    Cobros
                  </p>
                  <p className="text-sm font-bold">
                    {informeCobros.totales.cantidad}
                  </p>
                  <p className="text-[10px] text-cerulean-700">
                    {informeCobros.totales.estadias} estadía(s)
                  </p>
                </div>
                <div className="rounded-lg bg-cerulean-100 shadow p-3">
                  <p className="text-[10px] font-bold uppercase text-cerulean-700">
                    Total cobrado
                  </p>
                  <p className="text-sm font-bold">
                    {formatCurrency(informeCobros.totales.total)}
                  </p>
                  <p className="text-[10px] text-cerulean-700">
                    Efectivo {formatCurrency(informeCobros.totales.efectivo)} · MP{" "}
                    {formatCurrency(informeCobros.totales.mp)}
                  </p>
                </div>
              </section>

              <section className="w-full mt-4">
                <InformeCobrosTable
                  cobros={informeCobros.movimientos}
                  etiquetaFecha={informeCobros.etiquetaFecha}
                />
              </section>
            </>
          )}

          {informeAcarreos && (
            <>
              <section className="w-full mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-lg bg-cerulean-100 shadow p-3">
                  <p className="text-[10px] font-bold uppercase text-cerulean-700">
                    Tipo de informe
                  </p>
                  <p className="text-sm font-bold">{informeAcarreos.titulo}</p>
                </div>
                <div className="rounded-lg bg-cerulean-100 shadow p-3">
                  <p className="text-[10px] font-bold uppercase text-cerulean-700">
                    Período
                  </p>
                  <p className="text-sm font-bold">
                    {informeAcarreos.periodo.descripcion}
                  </p>
                  <p className="text-[10px] text-cerulean-700">
                    {formatDateFullWithHs(informeAcarreos.periodo.desde)} →{" "}
                    {formatDateFullWithHs(informeAcarreos.periodo.hasta)}
                  </p>
                </div>
                <div className="rounded-lg bg-cerulean-100 shadow p-3">
                  <p className="text-[10px] font-bold uppercase text-cerulean-700">
                    Acarreos
                  </p>
                  <p className="text-sm font-bold">
                    {informeAcarreos.totales.cantidad}
                  </p>
                  <p className="text-[10px] text-cerulean-700">
                    Cobrados {informeAcarreos.totales.cobrados} · Sin cargo{" "}
                    {informeAcarreos.totales.sinCargo}
                  </p>
                </div>
                <div className="rounded-lg bg-cerulean-100 shadow p-3">
                  <p className="text-[10px] font-bold uppercase text-cerulean-700">
                    En playa
                  </p>
                  <p className="text-sm font-bold">
                    {informeAcarreos.totales.enPlaya}
                  </p>
                  <p className="text-[10px] text-cerulean-700">
                    Egresados {informeAcarreos.totales.egresados}
                  </p>
                </div>
              </section>

              <section className="w-full mt-4">
                <InformeAcarreosTable
                  acarreos={informeAcarreos.movimientos}
                  etiquetaFecha={informeAcarreos.etiquetaFecha}
                />
              </section>
            </>
          )}

          {!informe && (
            <section className="w-full mt-4 rounded-lg bg-cerulean-50 p-6 text-center text-sm text-cerulean-700">
              Todavía no se generó ningún informe. Presioná{" "}
              <span className="font-bold">Generar informe</span> para elegir el
              tipo y el período.
            </section>
          )}
        </main>

        <GenerarInformeModal
          open={modalAbierto}
          onClose={() => setModalAbierto(false)}
          token={token}
          esSistemas={usuario.rol === "SISTEMAS"}
          puedeVerCobros={puedeVerCobros}
          onGenerado={setInforme}
        />
      </MainLayout>
    </PageLayout>
  );
}
