import type { MovimientoInforme } from "../../../types/Informe";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";

/**
 * Tabla con los autos que entraron o salieron de la playa en el período.
 * La fecha mostrada es la de ingreso o egreso a la playa según el tipo de informe.
 * Los playeros se muestran fuera de la tabla, agrupados por turno de barrera.
 */
export default function InformeTable({
  movimientos,
  etiquetaFecha,
  esMovimientosCombinados,
}: {
  movimientos: MovimientoInforme[];
  etiquetaFecha?: string;
  /** Informe MOVIMIENTOS: muestra entrada y salida por fila. */
  esMovimientosCombinados?: boolean;
}) {
  if (movimientos.length === 0) {
    return (
      <p className="rounded-lg bg-cerulean-50 p-6 text-center text-sm text-cerulean-700">
        No hay movimientos en el período seleccionado.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg bg-cerulean-50 shadow">
      <table className="w-full table border-collapse">
        <thead className="bg-cerulean-600 text-white text-left">
          <tr className="text-sm border-b border-cerulean-400">
            <th className="border-r px-2 py-2">Patente</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Vehículo</th>
            {esMovimientosCombinados ? (
              <>
                <th className="border-r px-2 py-2 border-cerulean-400">
                  Entrada
                </th>
                <th className="border-r px-2 py-2 border-cerulean-400">
                  Salida
                </th>
                <th className="border-r px-2 py-2 border-cerulean-400">
                  Estado
                </th>
              </>
            ) : (
              <th className="border-r px-2 py-2 border-cerulean-400">
                {etiquetaFecha ?? "Fecha y hora"}
              </th>
            )}
            <th className="px-2 py-2 border-cerulean-400">Barrera</th>
          </tr>
        </thead>

        <tbody className="bg-cerulean-50 text-xs">
          {movimientos.map((movimiento) => (
            <tr key={movimiento.id}>
              <td className="border-r border-b border-cerulean-200 px-2 py-2 font-bold">
                {movimiento.patente}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {[movimiento.marca, movimiento.modelo, movimiento.color]
                  .filter(Boolean)
                  .join(" ") || "-"}
              </td>
              {esMovimientosCombinados ? (
                <>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    {movimiento.fecha_entrada
                      ? formatDateFullWithHs(movimiento.fecha_entrada)
                      : "-"}
                  </td>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    {movimiento.fecha_salida
                      ? formatDateFullWithHs(movimiento.fecha_salida)
                      : "Sin salida"}
                  </td>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    {movimiento.estado ?? "-"}
                  </td>
                </>
              ) : (
                <td className="border-r border-b border-cerulean-200 px-2 py-2">
                  {formatDateFullWithHs(movimiento.fecha)}
                </td>
              )}
              <td className="border-b border-cerulean-200 px-2 py-2">
                {movimiento.barrera ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
