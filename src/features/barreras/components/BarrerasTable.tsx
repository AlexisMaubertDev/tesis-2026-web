import { Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import type { Barrera } from "../../../types/Barrera";

interface Props {
  barreras: Barrera[];
}

export default function BarrerasTable({ barreras }: Props) {
  return (
    <table className="w-full table border-collapse">
      <thead className="bg-cerulean-600 text-white text-left">
        <tr className="text-sm border-b border-cerulean-400">
          <th className="border-r px-2 py-2 border-cerulean-400">Ubicación</th>
          <th className="border-r px-2 py-2 border-cerulean-400">Sucursal</th>
          <th className="px-2 py-2 border-cerulean-400">Acciones</th>
        </tr>
      </thead>

      <tbody className="bg-cerulean-50 text-xs">
        {barreras.map((barrera) => (
          <tr key={barrera.id}>
            <td className="border-r border-b border-cerulean-200 px-2 py-2">
              {barrera.ubicacion}
            </td>

            <td className="border-r border-b border-cerulean-200 px-2 py-2">
              {barrera.Sucursal.nombre}
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
