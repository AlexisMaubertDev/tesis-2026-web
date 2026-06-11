import { Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import type { Caja } from "../../../types/Caja";

interface Props {
  cajas: Caja[];
}
export default function CajasTable({ cajas }: Props) {
  return (
    <table className="w-full table border-collapse">
      <thead className="bg-cerulean-600 text-white text-left">
        <tr className="text-sm border-b border-cerulean-400">
          <th className="border-r px-2 py-2 ">Número</th>
          <th className="border-r px-2 py-2 border-cerulean-400">Ref</th>
          <th className="border-r px-2 py-2 border-cerulean-400">Ref Pago</th>
          <th className="border-r px-2 py-2 border-cerulean-400">Sucursal</th>
          <th className="px-2 py-2 border-cerulean-400">Acciones</th>
        </tr>
      </thead>

      <tbody className="bg-cerulean-50 text-xs">
        {cajas.map((caja) => (
          <tr key={caja.id}>
            <td className="border-r border-b border-cerulean-200 px-2 py-2">
              {caja.numero_caja}
            </td>
            <td className="border-r border-b border-cerulean-200 px-2 py-2">
              {caja.referencia}
            </td>

            <td className="border-r border-b border-cerulean-200 px-2 py-2">
              {caja.referencia_pago}
            </td>
            <td className="border-r border-b border-cerulean-200 px-2 py-2">
              {caja.Sucursal.nombre}
            </td>

            <td className="border-b border-cerulean-200 px-2 py-2">
              <div className="flex items-center gap-2">
                <button
                  className="text-emerald-700 hover:text-emerald-500 transition-colors duration-300 cursor-pointer"
                  //onClick={() => handleEdit(caja)}
                >
                  <Tooltip title="Editar">
                    <EditIcon />
                  </Tooltip>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
