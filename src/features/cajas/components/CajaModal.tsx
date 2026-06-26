import Modal from "@mui/material/Modal";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState } from "../../../app/store";

import TextInput from "../../../components/ui/TextInput";
import SelectInput from "../../../components/ui/SelectInput";
import CallToActionButton from "../../../components/ui/CallToActionButton";

import { showSuccess } from "../../../app/store/snackbarSlice";
import type { Caja } from "../../../types/Caja";
import type { Sucursal } from "../../../types/Sucursal";
import { obtenerSucursales } from "../../sucursales/services/sucursalesService";
import { crearCaja, editarCaja } from "../services/cajasService";
// import { crearCaja } from "../services/cajasService";

type Props = {
  open: boolean;
  onClose: () => void;
  caja?: Caja;
  onSuccess?: () => void;
};

export type CajaForm = {
  id?: string;
  Sucursal: Sucursal;
  numero_caja: number;
  referencia: string;
  referencia_pago: string;
};

const initialFormData: Caja = {
  Sucursal: { id: "", nombre: "", direccion: "" },
  numero_caja: 1,
  referencia: "",
  referencia_pago: "",
};

export default function CajaModal({ open, onClose, caja, onSuccess }: Props) {
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  const [sucursales, setSucursales] = useState([]);
  const [formData, setFormData] = useState<Caja>(initialFormData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "numero_caja" ? Number(value) : value,
    }));
  };

  const verificarCampos = () => {
    if (!formData.Sucursal.id) {
      setError("Debe seleccionar una sucursal");
      return false;
    }

    if (!formData.numero_caja) {
      setError("Debe ingresar un número de caja");
      return false;
    }

    return true;
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);

    if (!verificarCampos()) return;

    setLoading(true);

    try {
      if (caja) {
        await editarCaja(token!, formData);

        dispatch(showSuccess("Caja modificada con éxito"));
      } else {
        await crearCaja(token!, formData);

        dispatch(showSuccess("Caja creada con éxito"));
      }

      setFormData(initialFormData);
      onClose();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Error al crear la caja. Intenta nuevamente más tarde.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caja) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        ...caja,
      });
    } else {
      setFormData(initialFormData);
    }

    setError(null);
  }, [caja, open]);

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
      <div className="absolute top-1/2 md:top-1/3 left-1/2 w-full max-w-4/5 md:max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans">
        <h2 className="text-center font-bold uppercase">
          {caja ? "Editar Caja" : "Crear Caja"}
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
            <label className="text-xs font-semibold">Número de Caja</label>

            <TextInput
              placeholder="Número de Caja"
              name="numero_caja"
              type="number"
              value={formData.numero_caja}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs font-semibold">Referencia</label>

            <TextInput
              placeholder="Referencia"
              name="referencia"
              type="text"
              value={formData.referencia}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs font-semibold">Referencia de Pago</label>

            <TextInput
              placeholder="Referencia de Pago"
              name="referencia_pago"
              type="text"
              value={formData.referencia_pago}
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
              {loading
                ? caja
                  ? "Guardando..."
                  : "Creando..."
                : caja
                  ? "Guardar cambios"
                  : "Crear Caja"}
            </CallToActionButton>
          </div>
        </form>
      </div>
    </Modal>
  );
}
