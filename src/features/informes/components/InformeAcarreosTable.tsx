import type { AcarreoInforme } from "../../../types/Informe";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import { etiquetaEstadoAcarreo } from "../../../app/constants/estados";

/**
 * Tabla con los acarreos realizados en el período: fecha, vehículo, sucursal,
 * grúa, personal interviniente, motivo/dirección y estado actual.
 */
export default function InformeAcarreosTable({
  acarreos,
  etiquetaFecha,
}: {
  acarreos: AcarreoInforme[];
  etiquetaFecha?: string;
}) {
  if (acarreos.length === 0) {
    return (
      <p className="rounded-lg bg-cerulean-50 p-6 text-center text-sm text-cerulean-700">
        No hay acarreos en el período seleccionado.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg bg-cerulean-50 shadow">
      <table className="w-full table border-collapse">
        <thead className="bg-cerulean-600 text-white text-left">
          <tr className="text-sm border-b border-cerulean-400">
            <th className="border-r px-2 py-2 border-cerulean-400">
              {etiquetaFecha ?? "Fecha del acarreo"}
            </th>
            <th className="border-r px-2 py-2 border-cerulean-400">Patente</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Vehículo</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Sucursal</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Grúa</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Personal</th>
            <th className="border-r px-2 py-2 border-cerulean-400">
              Motivo / dirección
            </th>
            <th className="px-2 py-2 border-cerulean-400">Estado</th>
          </tr>
        </thead>

        <tbody className="bg-cerulean-50 text-xs">
          {acarreos.map((acarreo) => (
            <tr key={acarreo.id}>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {formatDateFullWithHs(acarreo.fecha)}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2 font-bold">
                {acarreo.patente}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {[acarreo.marca, acarreo.modelo, acarreo.color]
                  .filter(Boolean)
                  .join(" ") || "-"}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {acarreo.sucursal ?? "-"}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {acarreo.grua
                  ? `${acarreo.grua.patente}${
                      acarreo.grua.numero != null
                        ? ` · N° ${acarreo.grua.numero}`
                        : ""
                    }`
                  : "-"}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                <p>{acarreo.chofer ?? "-"}</p>
                {acarreo.enganchador && (
                  <p className="text-[10px] text-cerulean-700">
                    Enganchador: {acarreo.enganchador}
                  </p>
                )}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                <p>{acarreo.motivo ?? "-"}</p>
                {acarreo.direccion && (
                  <p className="text-[10px] text-cerulean-700">
                    {acarreo.direccion}
                  </p>
                )}
              </td>
              <td className="border-b border-cerulean-200 px-2 py-2">
                {etiquetaEstadoAcarreo(acarreo.estado)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
