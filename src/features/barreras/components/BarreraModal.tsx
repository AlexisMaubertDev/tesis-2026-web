import Modal from "@mui/material/Modal";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState } from "../../../app/store";

import TextInput from "../../../components/ui/TextInput";
import SelectInput from "../../../components/ui/SelectInput";
import CallToActionButton from "../../../components/ui/CallToActionButton";

import { showSuccess } from "../../../app/store/snackbarSlice";
import type { Barrera } from "../../../types/Barrera";
import type { Sucursal } from "../../../types/Sucursal";
import { obtenerSucursales } from "../../sucursales/services/sucursalesService";
import { crearBarrera, editarBarrera } from "../services/barrerasService";

type Props = {
  open: boolean;
  onClose: () => void;
  barrera?: Barrera;
  onSuccess?: () => void;
};

export type BarreraForm = {
  id?: string;
  ubicacion: string;
  Sucursal: Sucursal;
};

const initialFormData: BarreraForm = {
  ubicacion: "",
  Sucursal: { id: "", nombre: "", direccion: "" },
};

export default function BarreraModal({
  open,
  onClose,
  barrera,
  onSuccess,
}: Props) {
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [formData, setFormData] = useState<BarreraForm>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (barrera) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        id: barrera.id,
        ubicacion: barrera.ubicacion,
        Sucursal: barrera.Sucursal,
      });
    } else {
      setFormData(initialFormData);
    }

    setError(null);
  }, [barrera, open]);

  useEffect(() => {
    if (!open || !token) return;

    const cargarSucursales = async () => {
      try {
        const res = await obtenerSucursales(token);
        setSucursales(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err.response?.data);
      }
    };

    cargarSucursales();
  }, [open, token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "id_sucursal") {
      const seleccionada = sucursales.find((s) => s.id === value);
      setFormData((prev) => ({
        ...prev,
        Sucursal: seleccionada ?? { ...prev.Sucursal, id: value },
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const verificarCampos = () => {
    if (formData.ubicacion.trim() === "") {
      setError("Debe ingresar la ubicación");
      return false;
    }

    if (!formData.Sucursal.id) {
      setError("Debe seleccionar una sucursal");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);

    if (!verificarCampos()) return;

    setLoading(true);

    try {
      const payload = {
        ubicacion: formData.ubicacion.trim(),
        Sucursal: { id: formData.Sucursal.id! },
      };

      if (barrera) {
        const res = await editarBarrera(token!, barrera.id, payload);
        dispatch(showSuccess(res.message ?? "Barrera modificada con éxito"));
      } else {
        const res = await crearBarrera(token!, payload);
        dispatch(showSuccess(res.message ?? "Barrera creada con éxito"));
      }

      setFormData(initialFormData);
      onSuccess?.();
      onClose();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.message || err?.message ||
          "Error al guardar la barrera. Intenta nuevamente más tarde.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setFormData(initialFormData);
        setError(null);
        onClose();
      }}
      sx={{ padding: 4 }}
    >
      <div className="max-h-[90vh] overflow-y-auto absolute top-1/2 md:top-1/3 left-1/2 w-full max-w-4/5 md:max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans">
        <h2 className="text-center font-bold uppercase">
          {barrera ? "Editar Barrera" : "Crear Barrera"}
        </h2>

        <form
          className="grid grid-cols-1 gap-4 mt-4"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold">Sucursal</label>

            <SelectInput
              placeholder="Sucursal"
              name="id_sucursal"
              value={formData.Sucursal.id}
              options={sucursales.map((sucursal: Sucursal) => ({
                value: sucursal.id ?? "",
                label: sucursal.nombre,
              }))}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold">Ubicación</label>

            <TextInput
              placeholder="Ubicación (Ej: Entrada principal)"
              name="ubicacion"
              type="text"
              value={formData.ubicacion}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div>
              <p className="text-xs text-red-900">{error}</p>
            </div>
          )}

          <div className="flex flex-col mx-auto">
            <CallToActionButton type="submit" disabled={loading}>
              {loading
                ? "Guardando..."
                : barrera
                  ? "Guardar cambios"
                  : "Crear Barrera"}
            </CallToActionButton>
          </div>
        </form>
      </div>
    </Modal>
  );
}
