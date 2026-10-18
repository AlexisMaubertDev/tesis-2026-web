import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HistoryIcon from "@mui/icons-material/History";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../../app/store";
import ChoiceModal from "../../../components/ui/ChoiceModal";
import { showError, showSuccess } from "../../../app/store/snackbarSlice";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import type { Vehiculo } from "../../../types/Vehiculo";
import { eliminarVehiculo } from "../services/vehiculosService";

type Props = {
  vehiculos: Vehiculo[];
  onEditar: (vehiculo: Vehiculo) => void;
  onVerMas: (vehiculo: Vehiculo) => void;
  onDeleted?: () => void;
};

export default function VehiculosTable({
  vehiculos,
  onEditar,
  onVerMas,
  onDeleted,
}: Props) {
  const { token, usuario } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [vehiculoAEliminar, setVehiculoAEliminar] = useState<Vehiculo | null>(
    null,
  );

  // El backend sólo permite editar/eliminar a SUPERVISOR y SISTEMAS (RF24).
  // El detalle ("Ver más") lo puede ver cualquier usuario autenticado.
  const puedeGestionar =
    usuario?.rol === "SUPERVISOR" || usuario?.rol === "SISTEMAS";

  const handleDelete = async () => {
    if (!vehiculoAEliminar?.id) {
      setVehiculoAEliminar(null);
      dispatch(
        showError(
          "No se pudo identificar el vehículo a eliminar. Intenta nuevamente más tarde.",
        ),
      );
      return;
    }

    try {
      await eliminarVehiculo(token!, vehiculoAEliminar.id);

      dispatch(showSuccess("Vehículo eliminado con exito"));
      onDeleted?.();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      dispatch(
        showError(
          error.response?.data?.message ||
            "Error al eliminar el vehículo. Intenta nuevamente más tarde.",
        ),
      );
    } finally {
      setVehiculoAEliminar(null);
    }
  };

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
            <th className="border-r px-2 py-2 border-cerulean-400">Sucursal</th>
            <th className="border-r px-2 py-2 border-cerulean-400 text-center">
              Acarreos
            </th>
            <th className="border-r px-2 py-2 border-cerulean-400">
              Último acarreo
            </th>
            <th className="border-r px-2 py-2 border-cerulean-400">En playa</th>
            <th className="px-2 py-2 border-cerulean-400">Acciones</th>
          </tr>
        </thead>

        <tbody className="bg-cerulean-50 text-xs">
          {vehiculos.map((vehiculo) => (
            <tr key={vehiculo.id ?? vehiculo.patente}>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {vehiculo.patente}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {vehiculo.marca}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {vehiculo.modelo}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {vehiculo.color}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {vehiculo.Sucursal?.nombre ?? "-"}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2 text-center">
                {vehiculo.cantidad_acarreos ?? 0}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {vehiculo.ultimo_acarreo
                  ? formatDateFullWithHs(vehiculo.ultimo_acarreo)
                  : "-"}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {vehiculo.en_playa ? "Sí" : "No"}
              </td>

              <td className="border-b border-cerulean-200 px-2 py-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="text-cerulean-700 hover:text-cerulean-500 transition-colors duration-300 cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/vehiculos/${encodeURIComponent(vehiculo.patente)}/historial`,
                      )
                    }
                  >
                    <Tooltip title="Ver historial">
                      <HistoryIcon />
                    </Tooltip>
                  </button>

                  <button
                    type="button"
                    className="text-cerulean-700 hover:text-cerulean-500 transition-colors duration-300 cursor-pointer"
                    onClick={() => onVerMas(vehiculo)}
                  >
                    <Tooltip title="Ver más">
                      <VisibilityIcon />
                    </Tooltip>
                  </button>

                  {puedeGestionar && (
                    <>
                      <button
                        type="button"
                        className="text-emerald-700 hover:text-emerald-500 transition-colors duration-300 cursor-pointer"
                        onClick={() => onEditar(vehiculo)}
                      >
                        <Tooltip title="Editar">
                          <EditIcon />
                        </Tooltip>
                      </button>

                      <button
                        type="button"
                        className="text-scarlet-rush-600 hover:text-scarlet-rush-300 transition-colors duration-300 cursor-pointer"
                        onClick={() => setVehiculoAEliminar(vehiculo)}
                      >
                        <Tooltip title="Eliminar">
                          <DeleteIcon />
                        </Tooltip>
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ChoiceModal
        open={vehiculoAEliminar !== null}
        setOpen={() => setVehiculoAEliminar(null)}
        title={`Estas seguro que quieres eliminar el vehículo ${vehiculoAEliminar?.patente ?? ""}?`}
        subtitle="Esta acción no se puede deshacer."
        disabled={false}
        confirm={handleDelete}
        cancel={() => setVehiculoAEliminar(null)}
      />
    </>
  );
}
