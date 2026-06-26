import Tooltip from "@mui/material/Tooltip";
import type { Sucursal } from "../../../types/Sucursal";
import EditIcon from "@mui/icons-material/Edit";
import PeopleIcon from "@mui/icons-material/People";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import StoreIcon from "@mui/icons-material/Store";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { Link } from "react-router-dom";

type Props = {
  sucursales: Sucursal[];
  handleEdit: (sucursal: Sucursal) => void;
};

export default function SucursalesTable({ sucursales, handleEdit }: Props) {
  return (
    <table className="w-full table border-collapse">
      <thead className="bg-cerulean-600 text-white text-left">
        <tr className="text-sm border-b border-cerulean-400">
          <th className="border-r px-2 py-2 ">Nombre</th>
          <th className="border-r px-2 py-2 border-cerulean-400">Dirección</th>

          <th className="border-r px-2 py-2 border-cerulean-400">Ver</th>
          <th className="px-2 py-2 border-cerulean-400">Acciones</th>
        </tr>
      </thead>

      <tbody className="bg-cerulean-50 text-xs">
        {sucursales.map((sucursal) => {
          const esSistemas = sucursal.nombre === "Sistemas";

          return (
            <tr key={sucursal.id}>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {sucursal.nombre}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {sucursal.direccion}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/usuarios?sucursal=${sucursal.nombre}`}
                    className={`text-blue-700 hover:text-blue-400  transition-colors duration-300 cursor-pointer`}
                  >
                    <Tooltip title="Usuarios">
                      <PeopleIcon />
                    </Tooltip>
                  </Link>
                  {esSistemas ? (
                    <span className="text-gray-400">
                      <Tooltip title="Grúas">
                        <DirectionsCarIcon />
                      </Tooltip>
                    </span>
                  ) : (
                    <Link
                      to={`/gruas?sucursal=${encodeURIComponent(sucursal.nombre)}`}
                      className="text-blue-700 hover:text-blue-400 transition-colors"
                    >
                      <Tooltip title="Grúas">
                        <DirectionsCarIcon />
                      </Tooltip>
                    </Link>
                  )}
                  {esSistemas ? (
                    <span className="text-gray-400">
                      <Tooltip title="Barreras">
                        <StoreIcon />
                      </Tooltip>
                    </span>
                  ) : (
                    <Link
                      to={`/barreras?sucursal=${encodeURIComponent(sucursal.nombre)}`}
                      className="text-blue-700 hover:text-blue-400 transition-colors"
                    >
                      <Tooltip title="Barreras">
                        <StoreIcon />
                      </Tooltip>
                    </Link>
                  )}
                  {esSistemas ? (
                    <span className="text-gray-400">
                      <Tooltip title="Cajas">
                        <MonetizationOnIcon />
                      </Tooltip>
                    </span>
                  ) : (
                    <Link
                      to={`/cajas?sucursal=${encodeURIComponent(sucursal.nombre)}`}
                      className="text-blue-700 hover:text-blue-400 transition-colors"
                    >
                      <Tooltip title="Cajas">
                        <MonetizationOnIcon />
                      </Tooltip>
                    </Link>
                  )}
                </div>
              </td>
              <td className="border-b border-cerulean-200 px-2 py-2">
                <div className="flex items-center gap-2">
                  <button
                    className="text-emerald-700 hover:text-emerald-500 transition-colors duration-300 cursor-pointer"
                    onClick={() => handleEdit(sucursal)}
                  >
                    <Tooltip title="Editar">
                      <EditIcon />
                    </Tooltip>
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
