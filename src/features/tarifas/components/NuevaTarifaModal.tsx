import Modal from "@mui/material/Modal";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState } from "../../../app/store";
import TextInput from "../../../components/ui/TextInput";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import { showSuccess } from "../../../app/store/snackbarSlice";
import { formatCurrency } from "../../../app/utils/money";
import type { Tarifa } from "../../../types/Tarifa";
import { crearTarifa } from "../services/tarifasService";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Tarifa vigente: se usa para mostrar la actual y validar que la nueva sea mayor. */
  vigente: Tarifa | null;
  onSuccess?: () => void;
};

type FormData = {
  acarreo: string;
  estadia: string;
};

const initialFormData: FormData = { acarreo: "", estadia: "" };

export default function NuevaTarifaModal({
  open,
  onClose,
  vigente,
  onSuccess,
}: Props) {
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const cerrar = () => {
    setFormData(initialFormData);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const acarreo = Number(formData.acarreo);
    const estadia = Number(formData.estadia);

    if (formData.acarreo === "" || formData.estadia === "") {
      setError("Completá la tarifa de acarreo y la de estadía.");
      return;
    }

    if (
      !Number.isFinite(acarreo) ||
      !Number.isFinite(estadia) ||
      acarreo < 0 ||
      estadia < 0
    ) {
      setError("Las tarifas deben ser números mayores o iguales a cero.");
      return;
    }

    // CU20 (flujo alternativo 2.1): sólo se admiten valores mayores a los
    // actuales.
    if (vigente && (acarreo < vigente.acarreo || estadia < vigente.estadia)) {
      setError("Las tarifas nuevas deben ser mayores a las actuales.");
      return;
    }

    setLoading(true);

    try {
      await crearTarifa(token!, { acarreo, estadia });
      dispatch(showSuccess("Tarifa actualizada con éxito"));
      setFormData(initialFormData);
      onSuccess?.();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "No se pudo configurar la tarifa. Intentá nuevamente más tarde.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={cerrar} sx={{ padding: 4 }}>
      <div className="absolute top-1/2 md:top-1/3 left-1/2 w-full max-w-4/5 md:max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans">
        <h2 className="text-center font-bold uppercase">Nueva tarifa</h2>

        {vigente ? (
          <p className="mt-2 text-center text-xs text-cerulean-800">
            Tarifa actual: acarreo {formatCurrency(vigente.acarreo)} · estadía{" "}
            {formatCurrency(vigente.estadia)}
          </p>
        ) : (
          <p className="mt-2 text-center text-xs text-cerulean-800">
            Todavía no hay una tarifa configurada.
          </p>
        )}

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold">Tarifa de acarreo</label>
            <TextInput
              placeholder="Importe del acarreo"
              name="acarreo"
              type="number"
              value={formData.acarreo}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold">
              Tarifa de estadía (por día)
            </label>
            <TextInput
              placeholder="Importe de cada estadía"
              name="estadia"
              type="number"
              value={formData.estadia}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="md:col-span-2">
              <p className="text-xs text-red-900">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 md:col-span-2 mt-2">
            <CallToActionButton type="button" handleSubmit={cerrar}>
              Cancelar
            </CallToActionButton>
            <CallToActionButton type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar tarifa"}
            </CallToActionButton>
          </div>
        </form>
      </div>
    </Modal>
  );
}
