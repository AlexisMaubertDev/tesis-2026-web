import Modal from "@mui/material/Modal";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import TextInput from "../../../components/ui/TextInput";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import { showSuccess } from "../../../app/store/snackbarSlice";
import type { Vehiculo } from "../../../types/Vehiculo";
import { editarVehiculo } from "../services/vehiculosService";

type Props = {
  open: boolean;
  onClose: () => void;
  vehiculo: Vehiculo | null;
  onSuccess?: () => void;
};

type VehiculoForm = {
  patente: string;
  marca: string;
  modelo: string;
  color: string;
};

const buildFormData = (vehiculo: Vehiculo | null): VehiculoForm => ({
  patente: vehiculo?.patente ?? "",
  marca: vehiculo?.marca ?? "",
  modelo: vehiculo?.modelo ?? "",
  color: vehiculo?.color ?? "",
});

export default function EditarVehiculoModal({
  open,
  onClose,
  vehiculo,
  onSuccess,
}: Props) {
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<VehiculoForm>(() =>
    buildFormData(vehiculo),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!vehiculo?.id) {
      setError("No se pudo identificar el vehículo a editar.");
      return;
    }

    if (
      !formData.patente.trim() ||
      !formData.marca.trim() ||
      !formData.modelo.trim() ||
      !formData.color.trim()
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);

    try {
      await editarVehiculo(token!, vehiculo.id, formData);

      dispatch(showSuccess("Vehículo actualizado con exito"));
      onSuccess?.();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Error al editar el vehículo. Intenta nuevamente más tarde.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setError(null);
        onClose();
      }}
      sx={{ padding: 4 }}
    >
      <div className="absolute top-1/2 left-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans">
        <h2 className="text-center font-bold uppercase">Editar Vehículo</h2>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="patente" className="text-xs font-semibold">
              Patente
            </label>
            <TextInput
              placeholder="Patente"
              name="patente"
              type="text"
              onChange={handleChange}
              value={formData.patente}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="marca" className="text-xs font-semibold">
              Marca
            </label>
            <TextInput
              placeholder="Marca"
              name="marca"
              type="text"
              onChange={handleChange}
              value={formData.marca}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="modelo" className="text-xs font-semibold">
              Modelo
            </label>
            <TextInput
              placeholder="Modelo"
              name="modelo"
              type="text"
              onChange={handleChange}
              value={formData.modelo}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="color" className="text-xs font-semibold">
              Color
            </label>
            <TextInput
              placeholder="Color"
              name="color"
              type="text"
              onChange={handleChange}
              value={formData.color}
            />
          </div>
          {error && (
            <div className="flex flex-col md:col-span-2 gap-1">
              <p className="text-xs text-red-900 text-left">{error}</p>
            </div>
          )}
          <div className="flex flex-col md:col-span-2 gap-1 md:mx-auto">
            <CallToActionButton type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </CallToActionButton>
          </div>
        </form>
      </div>
    </Modal>
  );
}
