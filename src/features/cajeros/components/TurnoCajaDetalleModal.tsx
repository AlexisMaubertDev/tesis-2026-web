import { Modal } from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import { formatCurrency } from "../../../app/utils/money";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import DetailItem from "../../../components/ui/DetailItem";
import type { TurnoCajaDetalle } from "../../../types/TurnoCaja";
import { abrirComprobanteCobro } from "../../cobros/services/cobrosService";
import { abrirInformeTurnoCaja } from "../../usuarios/services/usuariosService";
import AgregarIncidenciaTurnoModal from "../../turnos/components/AgregarIncidenciaTurnoModal";

type Props = {
  open: boolean;
  onClose: () => void;
  detalle: TurnoCajaDetalle | null;
  /** Vuelve a pedir el detalle del turno (ej: tras agregar una incidencia). */
  onRefrescar?: () => void;
};

/**
 * Modal con el detalle completo del turno de caja (cerrado o abierto): fechas,
 * usuario/caja, resumen y lista de cobros con sus acarreos y vehículos. El
 * supervisor (o sistemas) puede agregar/mirar la incidencia del turno.
 */
export default function TurnoCajaDetalleModal({
  open,
  onClose,
  detalle,
  onRefrescar,
}: Props) {
  const { usuario, token } = useSelector((state: RootState) => state.auth);

  // La incidencia del turno sólo la puede agregar un supervisor.
  const puedeAgregarIncidencia =
    usuario?.rol === "SUPERVISOR" || usuario?.rol === "SISTEMAS";

  // Si se está agregando/mirando la incidencia del turno.
  const [turnoIncidencia, setTurnoIncidencia] = useState(false);
  // Cobro cuyo comprobante se está generando.
  const [generando, setGenerando] = useState<string | null>(null);
  // Si se está generando el informe del turno.
  const [generandoInforme, setGenerandoInforme] = useState(false);

  const turno = detalle?.turno ?? null;
  const cobros = detalle?.cobros ?? [];
  const totales = detalle?.totales;

  const generarPdf = async (id_cobro: string) => {
    if (!token) return;

    setGenerando(id_cobro);

    try {
      await abrirComprobanteCobro(token, id_cobro);
    } catch {
      // El modal no tiene su propio cartel de error: se avisa por consola.
      console.error("No se pudo generar el comprobante PDF.");
    } finally {
      setGenerando(null);
    }
  };

  // Informe consolidado del turno (RF15 / CU13): PDF en otra pestaña.
  const generarInforme = async () => {
    if (!token || !turno?.id) return;

    setGenerandoInforme(true);

    try {
      await abrirInformeTurnoCaja(token, turno.id);
    } catch {
      console.error("No se pudo generar el informe del turno.");
    } finally {
      setGenerandoInforme(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} sx={{ padding: 4 }}>
        <div className="absolute top-1/2 left-1/2 w-4/5 md:max-w-4xl max-h-[95vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans flex flex-col gap-4">
          <h2 className="text-center text-xl font-bold">Detalle del turno de caja</h2>

          {turno && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold uppercase">Turno</h3>
              <DetailItem etiqueta="Caja" valor={turno.Caja?.numero_caja ?? "-"} />
              <DetailItem etiqueta="Referencia" valor={turno.Caja?.referencia ?? "-"} />
              <DetailItem
                etiqueta="Usuario"
                valor={
                  turno.Usuario
                    ? `${turno.Usuario.nombre} ${turno.Usuario.apellido} (DNI ${turno.Usuario.dni})`
                    : "-"
                }
              />
              <DetailItem etiqueta="Rol" valor={turno.Usuario?.rol ?? "-"} />
              <DetailItem etiqueta="Apertura" valor={formatDateFullWithHs(turno.apertura)} />
              <DetailItem
                etiqueta="Cierre"
                valor={turno.cierre ? formatDateFullWithHs(turno.cierre) : "En curso"}
              />
              <DetailItem etiqueta="Estado" valor={turno.activo ? "Abierto" : "Cerrado"} />
              <div className="flex flex-wrap justify-end gap-2">
                <CallToActionButton
                  type="button"
                  handleSubmit={generarInforme}
                  disabled={generandoInforme}
                >
                  {generandoInforme ? "Generando..." : "Ver informe"}
                </CallToActionButton>
                {puedeAgregarIncidencia && (
                  <CallToActionButton
                    type="button"
                    handleSubmit={() => setTurnoIncidencia(true)}
                  >
                    {turno.incidencias
                      ? "Ver incidencias del turno"
                      : "Agregar incidencia al turno"}
                  </CallToActionButton>
                )}
              </div>
            </div>
          )}

          {totales && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold uppercase">Resumen del turno</h3>
              <DetailItem etiqueta="Cantidad de cobros" valor={String(totales.cantidad)} />
              <DetailItem etiqueta="Total" valor={formatCurrency(totales.total)} />
              <DetailItem etiqueta="Efectivo" valor={formatCurrency(totales.efectivo)} />
              <DetailItem etiqueta="Mercado Pago" valor={formatCurrency(totales.mp)} />
            </div>
          )}

          {detalle?.arqueo && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold uppercase">Arqueo de cierre</h3>
              <DetailItem
                etiqueta="N° de sobre"
                valor={detalle.arqueo.numero_sobre ?? "-"}
              />
              <DetailItem
                etiqueta="Efectivo esperado"
                valor={formatCurrency(detalle.arqueo.efectivoEsperado)}
              />
              <DetailItem
                etiqueta="Efectivo contado"
                valor={
                  detalle.arqueo.efectivoContado === null
                    ? "No informado"
                    : formatCurrency(detalle.arqueo.efectivoContado)
                }
              />
              {detalle.arqueo.diferencia !== null && (
                <DetailItem
                  etiqueta="Diferencia"
                  valor={`${formatCurrency(Math.abs(detalle.arqueo.diferencia))} (${
                    detalle.arqueo.diferencia > 0
                      ? "sobrante"
                      : detalle.arqueo.diferencia < 0
                        ? "faltante"
                        : "sin diferencia"
                  })`}
                />
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold uppercase">
              Cobros {cobros.length ? `(${cobros.length})` : ""}
            </h3>

            {cobros.length === 0 && (
              <p className="text-xs text-cerulean-800">No hay cobros en este turno.</p>
            )}

            {cobros.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full table border-collapse text-xs">
                  <thead className="bg-cerulean-600 text-white text-left">
                    <tr className="border-b border-cerulean-400">
                      <th className="border-r px-2 py-1 border-cerulean-400">Fecha cobro</th>
                      <th className="border-r px-2 py-1 border-cerulean-400">Patente</th>
                      <th className="border-r px-2 py-1 border-cerulean-400">Vehículo</th>
                      <th className="border-r px-2 py-1 border-cerulean-400">Fecha acarreo</th>
                      <th className="border-r px-2 py-1 border-cerulean-400">Estadías</th>
                      <th className="border-r px-2 py-1 border-cerulean-400">Total</th>
                      <th className="border-r px-2 py-1 border-cerulean-400">Efectivo</th>
                      <th className="border-r px-2 py-1 border-cerulean-400">MP</th>
                      <th className="border-r px-2 py-1 border-cerulean-400">Factura</th>
                      <th className="px-2 py-1 border-cerulean-400">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-cerulean-50">
                    {cobros.map((c) => {
                      const v = c.Acarreo?.Vehiculo;
                      return (
                        <tr key={c.id}>
                          <td className="border-r border-b border-cerulean-200 px-2 py-1">
                            {formatDateFullWithHs(c.fecha)}
                          </td>
                          <td className="border-r border-b border-cerulean-200 px-2 py-1 font-bold">
                            {v?.patente ?? "-"}
                          </td>
                          <td className="border-r border-b border-cerulean-200 px-2 py-1">
                            {[v?.marca, v?.modelo, v?.color].filter(Boolean).join(" - ") || "-"}
                          </td>
                          <td className="border-r border-b border-cerulean-200 px-2 py-1">
                            {c.Acarreo?.fecha_acarreo ? formatDateFullWithHs(c.Acarreo.fecha_acarreo) : "-"}
                          </td>
                          <td className="border-r border-b border-cerulean-200 px-2 py-1">
                            {c.estadias ?? "-"}
                          </td>
                          <td className="border-r border-b border-cerulean-200 px-2 py-1">
                            {formatCurrency(c.total)}
                          </td>
                          <td className="border-r border-b border-cerulean-200 px-2 py-1">
                            {formatCurrency(c.efectivo)}
                          </td>
                          <td className="border-r border-b border-cerulean-200 px-2 py-1">
                            {formatCurrency(c.mp)}
                          </td>
                          <td className="border-r border-b border-cerulean-200 px-2 py-1">
                            {c.numero_factura ?? "-"}
                          </td>
                          <td className="border-b border-cerulean-200 px-2 py-1">
                            <CallToActionButton
                              type="button"
                              handleSubmit={() => generarPdf(c.id)}
                              disabled={generando === c.id}
                              className="whitespace-nowrap"
                            >
                              {generando === c.id ? "Generando..." : "Generar PDF"}
                            </CallToActionButton>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-center mt-4">
            <CallToActionButton type="button" handleSubmit={onClose}>
              Cerrar
            </CallToActionButton>
          </div>
        </div>
      </Modal>

      <AgregarIncidenciaTurnoModal
        open={turnoIncidencia}
        onClose={() => setTurnoIncidencia(false)}
        tipo="caja"
        turno={turno}
        descripcion={
          turno
            ? `Caja ${turno.Caja?.numero_caja ?? "-"} · Turno ${turno.turno || "-"}`
            : undefined
        }
        onSuccess={onRefrescar}
      />
    </>
  );
}
