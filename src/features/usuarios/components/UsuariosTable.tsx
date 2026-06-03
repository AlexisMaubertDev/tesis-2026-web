import type { Usuario } from "../../../types/Usuario";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import Tooltip from "@mui/material/Tooltip";

type Props = {
  usuarios: Usuario[];
};

export default function UsuariosTable({ usuarios }: Props) {
  return (
    <>
      {/* Desktop */}
      <table className="w-full hidden lg:table border-collapse">
        <thead className="bg-cerulean-600 text-white text-left">
          <tr className="text-sm border-b border-cerulean-400">
            <th className="border-r px-2 py-2 ">Nombre</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Apellido</th>
            <th className="border-r px-2 py-2 border-cerulean-400">DNI</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Legajo</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Sucursal</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Turno</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Email</th>
            <th className="border-r px-2 py-2 border-cerulean-400">
              Bloqueado
            </th>

            <th className="border-r px-2 py-2 border-cerulean-400">Domingos</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Rol</th>
            <th className="px-2 py-2 border-cerulean-400">Acciones</th>
          </tr>
        </thead>

        <tbody className="bg-cerulean-50 text-xs">
          {usuarios.map((usuario) => (
            <tr key={usuario.legajo}>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {usuario.nombre}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {usuario.apellido}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {usuario.dni}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {usuario.legajo}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {usuario.Sucursal.nombre}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {usuario.numero_turno}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2 break-all">
                {usuario.email}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {usuario.bloqueado ? "Sí" : "No"}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {usuario.trabaja_domingo ? "Sí" : "No"}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {usuario.rol}
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

                  <button className="text-blue-700 hover:text-blue-400 transition-colors duration-300 cursor-pointer">
                    <Tooltip title="Cambiar rol">
                      <AdminPanelSettingsIcon />
                    </Tooltip>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile / Tablet */}
      <div className="flex flex-col gap-4 lg:hidden">
        {usuarios.map((usuario) => (
          <div
            key={usuario.legajo}
            className="bg-san-marino-100 border border-san-marino-300 rounded-xl shadow-sm p-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-san-marino-800">
                  {usuario.nombre} {usuario.apellido}
                </h2>

                <p className="text-sm text-gray-600">
                  Legajo: {usuario.legajo}
                </p>
              </div>

              <span className="text-xs bg-san-marino-500 text-white px-2 py-1 rounded-full">
                {usuario.rol}
              </span>
            </div>

            {/* Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
              <div>
                <p className="font-semibold text-gray-700">DNI</p>
                <p>{usuario.dni}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-700">Sucursal</p>
                <p>{usuario.Sucursal.nombre}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-700">Turno</p>
                <p>{usuario.numero_turno}</p>
              </div>

              <div className="sm:col-span-2">
                <p className="font-semibold text-gray-700">Email</p>
                <p className="break-all">{usuario.email}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Bloqueado</p>
                <p>{usuario.bloqueado ? "Sí" : "No"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Trabaja domingos</p>
                <p>{usuario.trabaja_domingo ? "Sí" : "No"}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-5 border-t pt-4">
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

              <button className="text-blue-700 hover:text-blue-400 transition-colors duration-300 cursor-pointer">
                <Tooltip title="Cambiar rol">
                  <AdminPanelSettingsIcon />
                </Tooltip>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
