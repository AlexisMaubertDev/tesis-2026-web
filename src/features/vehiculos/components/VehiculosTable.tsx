import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import ChoiceModal from "../../../components/ui/ChoiceModal";
import { showError, showSuccess } from "../../../app/store/snackbarSlice";
import type { Vehiculo } from "../../../types/Vehiculo";
import { eliminarVehiculo } from "../services/vehiculosService";

type Props = {
  vehiculos: Vehiculo[];
  onEditar: (vehiculo: Vehiculo) => void;
  onDeleted?: () => void;
};

export default function VehiculosTable({
  vehiculos,
  onEditar,
  onDeleted,
}: Props) {
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [vehiculoAEliminar, setVehiculoAEliminar] = useState<Vehiculo | null>(
    null,
  );

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
                  <button
                    className="text-emerald-700 hover:text-emerald-500 transition-colors duration-300 cursor-pointer"
                    onClick={() => onEditar(vehiculo)}
                  >
                    <Tooltip title="Editar">
                      <EditIcon />
                    </Tooltip>
                  </button>

                  <button
                    className="text-rose-700 hover:text-rose-400 transition-colors duration-300 cursor-pointer"
                    onClick={() => setVehiculoAEliminar(vehiculo)}
                  >
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
