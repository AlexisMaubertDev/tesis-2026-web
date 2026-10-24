import type { CobroInformeFila } from "../../../types/Informe";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import { formatCurrency } from "../../../app/utils/money";

/**
 * Tabla con los cobros realizados en el período (RF21 / CU12): fecha del cobro,
 * patente, vehículo, caja y cajero, estadías, importes y N° de factura.
 */
export default function InformeCobrosTable({
  cobros,
  etiquetaFecha,
}: {
  cobros: CobroInformeFila[];
  etiquetaFecha?: string;
}) {
  if (cobros.length === 0) {
    return (
      <p className="rounded-lg bg-cerulean-50 p-6 text-center text-sm text-cerulean-700">
        No hay cobros en el período seleccionado.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg bg-cerulean-50 shadow">
      <table className="w-full table border-collapse">
        <thead className="bg-cerulean-600 text-white text-left">
          <tr className="text-sm border-b border-cerulean-400">
            <th className="border-r px-2 py-2 border-cerulean-400">
              {etiquetaFecha ?? "Fecha del cobro"}
            </th>
            <th className="border-r px-2 py-2 border-cerulean-400">Patente</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Vehículo</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Cajero</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Caja</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Estadías</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Total</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Efectivo</th>
            <th className="border-r px-2 py-2 border-cerulean-400">M. Pago</th>
            <th className="px-2 py-2 border-cerulean-400">Factura</th>
          </tr>
        </thead>

        <tbody className="bg-cerulean-50 text-xs">
          {cobros.map((cobro) => (
            <tr key={cobro.id}>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {formatDateFullWithHs(cobro.fecha)}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2 font-bold">
                {cobro.patente}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {[cobro.marca, cobro.modelo, cobro.color]
                  .filter(Boolean)
                  .join(" ") || "-"}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {cobro.cajero ?? "-"}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {cobro.caja ? `N° ${cobro.caja.numero_caja}` : "-"}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {cobro.estadias ?? "-"}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {formatCurrency(cobro.total)}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {formatCurrency(cobro.efectivo)}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {formatCurrency(cobro.mp)}
              </td>
              <td className="border-b border-cerulean-200 px-2 py-2">
                {cobro.numero_factura ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
