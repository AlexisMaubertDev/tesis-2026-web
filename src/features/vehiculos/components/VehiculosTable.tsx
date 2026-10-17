import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import type { Vehiculo } from "../../../types/Vehiculo";

type Props = {
  vehiculos: Vehiculo[];
};

export default function VehiculosTable({ vehiculos }: Props) {
  return (
    <>
      {/* Desktop */}
      <table className="w-full table border-collapse">
        <thead className="bg-cerulean-600 text-white text-left">
          <tr className="text-sm border-b border-cerulean-400">
            <th className="border-r px-2 py-2 ">Patente</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Marca</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Modelo</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Color</th>
            <th className="px-2 py-2 border-cerulean-400">Acciones</th>
          </tr>
        </thead>

        <tbody className="bg-cerulean-50 text-xs">
          {vehiculos.map((vehiculo) => (
            <tr key={vehiculo.patente}>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {vehiculo.patente}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {vehiculo.marca || "-"}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {vehiculo.modelo || "-"}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {vehiculo.color || "-"}
              </td>

              <td className="border-b border-cerulean-200 px-2 py-2">
                <div className="flex items-center gap-2">
                  <button className="text-emerald-700 hover:text-emerald-500 transition-colors duration-300 cursor-pointer">
                    <Tooltip title="Editar">
                      <EditIcon />
                    </Tooltip>
                  </button>

                  <button className="text-rose-700 hover:text-rose-400 transition-colors duration-300 cursor-pointer">
                    <Tooltip title="Eliminar">
                      <DeleteIcon />
                    </Tooltip>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
