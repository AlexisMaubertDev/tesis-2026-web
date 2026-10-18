import { Chip } from "@mui/material";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import { formatCurrency } from "../../../app/utils/money";
import type { Tarifa } from "../../../types/Tarifa";

interface Props {
  tarifas: Tarifa[];
}

export default function TarifasTable({ tarifas }: Props) {
  if (tarifas.length === 0) {
    return (
      <p className="text-xs text-cerulean-800">
        Todavía no hay tarifas configuradas.
      </p>
    );
  }

  return (
    <table className="w-full table border-collapse">
      <thead className="bg-cerulean-600 text-white text-left">
        <tr className="text-sm border-b border-cerulean-400">
          <th className="border-r px-2 py-2 border-cerulean-400">Acarreo</th>
          <th className="border-r px-2 py-2 border-cerulean-400">
            Estadía (12 h)
          </th>
          <th className="border-r px-2 py-2 border-cerulean-400">Vigente</th>
          <th className="border-r px-2 py-2 border-cerulean-400">
            Vigente desde
          </th>
          <th className="px-2 py-2 border-cerulean-400">Vigente hasta</th>
        </tr>
      </thead>

      <tbody className="bg-cerulean-50 text-xs">
        {tarifas.map((tarifa) => (
          <tr key={tarifa.id}>
            <td className="border-r border-b border-cerulean-200 px-2 py-2">
              {formatCurrency(tarifa.acarreo)}
            </td>
            <td className="border-r border-b border-cerulean-200 px-2 py-2">
              {formatCurrency(tarifa.estadia)}
            </td>
            <td className="border-r border-b border-cerulean-200 px-2 py-2">
              <Chip
                size="small"
                label={tarifa.vigente ? "Vigente" : "Cerrada"}
                color={tarifa.vigente ? "success" : "default"}
              />
            </td>
            <td className="border-r border-b border-cerulean-200 px-2 py-2">
              {formatDateFullWithHs(tarifa.vigente_desde)}
            </td>
            <td className="border-b border-cerulean-200 px-2 py-2">
              {tarifa.vigente_hasta
                ? formatDateFullWithHs(tarifa.vigente_hasta)
                : "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
