import Modal from "@mui/material/Modal";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";

import TextInput from "../../../components/ui/TextInput";
import SelectInput from "../../../components/ui/SelectInput";
import CallToActionButton from "../../../components/ui/CallToActionButton";

import { showSuccess } from "../../../app/store/snackbarSlice";
import { obtenerSucursales } from "../../sucursales/services/sucursalesService";
import type { Sucursal } from "../../../types/Sucursal";
import type { Grua } from "../../../types/Grua";
import { crearGrua } from "../services/gruasServices";
// import { crearGrua } from "../services/gruasService";

type Props = {
  open: boolean;
  onClose: () => void;
  grua?: Grua;
  onSuccess?: () => void;
};

export type GruaForm = Omit<Grua, "id">;

const initialFormData: GruaForm = {
  Sucursal: {
    id: "",
    nombre: "",
    direccion: "",
  },
  patente: "",
  modelo: "",
  numero: 1,
  estado: "DISPONIBLE",
  observaciones: null,
  incidencias: null,
};

export default function GruaModal({ open, onClose, grua, onSuccess }: Props) {
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<GruaForm>(initialFormData);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "numero" ? Number(value) : value,
    }));
  };

  useEffect(() => {
    if (!token) return;

    const cargarSucursales = async () => {
      try {
        const res = await obtenerSucursales(token);
        setSucursales(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(error.response?.data);
      }
    };

    cargarSucursales();
  }, [token]);

  const verificarCampos = () => {
    if (!formData.Sucursal.id) {
      setError("Debe seleccionar una sucursal");
      return false;
    }

    if (!formData.patente.trim()) {
      setError("La patente es obligatoria");
      return false;
    }

    if (!formData.modelo.trim()) {
      setError("El modelo es obligatorio");
      return false;
    }

    if (!formData.numero) {
      setError("Debe ingresar un número");
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
      const res = await crearGrua(token!, formData);
      console.log(res);

      dispatch(showSuccess("Grúa creada con éxito"));

      setFormData(initialFormData);
      onClose();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Error al crear la grúa. Intenta nuevamente más tarde.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (grua) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        ...grua,
      });
    } else {
      setFormData(initialFormData);
    }

    setError(null);
  }, [grua, open]);

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
      <div className="absolute top-1/2 md:top-1/3 left-1/2 w-full max-w-4/5 md:max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans">
        <h2 className="text-center font-bold uppercase">
          {grua ? "Editar Grúa" : "Crear Grúa"}
        </h2>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold">Sucursal</label>

            <SelectInput
              placeholder="Sucursal"
              name="id_sucursal"
              value={formData.Sucursal.id}
              options={sucursales.map((sucursal: Sucursal) => ({
                value: sucursal.id,
                label: sucursal.nombre,
              }))}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  Sucursal: {
                    ...prev.Sucursal,
                    id: e.target.value,
                  },
                }));
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold">Patente</label>

            <TextInput
              placeholder="Patente"
              name="patente"
              type="text"
              value={formData.patente}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold">Modelo</label>

            <TextInput
              placeholder="Modelo"
              name="modelo"
              type="text"
              value={formData.modelo}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold">Número</label>

            <TextInput
              placeholder="Número"
              name="numero"
              type="number"
              value={formData.numero}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold">Estado</label>

            <SelectInput
              placeholder="Estado"
              name="estado"
              value={formData.estado}
              options={[
                {
                  value: "DISPONIBLE",
                  label: "Disponible",
                },
                {
                  value: "EN_SERVICIO",
                  label: "En servicio",
                },
                {
                  value: "FUERA_DE_SERVICIO",
                  label: "Fuera de servicio",
                },
                {
                  value: "MANTENIMIENTO",
                  label: "Mantenimiento",
                },
              ]}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="md:col-span-2">
              <p className="text-xs text-red-900">{error}</p>
            </div>
          )}

          <div className="flex flex-col md:col-span-2 md:mx-auto">
            <CallToActionButton type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Grúa"}
            </CallToActionButton>
          </div>
        </form>
      </div>
    </Modal>
  );
}
