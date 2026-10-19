import { Modal } from "@mui/material";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import { formatCurrency } from "../../../app/utils/money";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import DetailItem from "../../../components/ui/DetailItem";
import type { TurnoCajaDetalle } from "../../../types/TurnoCaja";

type Props = {
  open: boolean;
  onClose: () => void;
  detalle: TurnoCajaDetalle | null;
};

/**
 * Modal con el detalle completo del turno de caja (cerrado o abierto): fechas,
 * usuario/caja, resumen y lista de cobros con sus acarreos y vehículos.
 */
export default function TurnoCajaDetalleModal({ open, onClose, detalle }: Props) {
  const turno = detalle?.turno ?? null;
  const cobros = detalle?.cobros ?? [];
  const totales = detalle?.totales;

  return (
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
                    <th className="px-2 py-1 border-cerulean-400">Factura</th>
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
                        <td className="border-b border-cerulean-200 px-2 py-1">
                          {c.numero_factura ?? "-"}
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
  );
}
