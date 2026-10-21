import { Modal } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { showError, showSuccess } from "../../../app/store/snackbarSlice";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import TextArea from "../../../components/ui/TextArea";
import type { Vehiculo } from "../../../types/Vehiculo";
import { sacarSinCargo } from "../../vehiculos/services/vehiculosService";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  vehiculo: Vehiculo | null;
  /** Se llama después de registrar la salida sin cargo (para refrescar la vista). */
  onSuccess?: () => void;
};

/**
 * Modal del supervisor para autorizar la salida sin cargo de un vehículo
 * ingresado en la playa. El motivo es obligatorio y queda guardado como
 * incidencia del acarreo (además de la auditoría).
 */
export default function SinCargoModal({
  open,
  setOpen,
  vehiculo,
  onSuccess,
}: Props) {
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cerrar = () => {
    setOpen(false);
    setMotivo("");
    setError(null);
  };

  const handleCancelar = () => {
    if (enviando) return;
    cerrar();
  };

  const handleConfirmar = async () => {
    if (motivo.trim() === "") {
      setError("Ingresá el motivo de la salida sin cargo.");
      return;
    }

    const acarreoId = vehiculo?.ultimo_acarreo_id;

    if (!acarreoId) {
      setError(
        "No se pudo identificar el acarreo. Intentá nuevamente más tarde.",
      );
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      await sacarSinCargo(token!, acarreoId, motivo.trim());
      dispatch(showSuccess("Vehículo egresado sin cargo con éxito"));
      onSuccess?.();
      cerrar();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "No se pudo registrar la salida sin cargo. Intentá nuevamente más tarde.";
      setError(message);
      dispatch(showError(message));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal open={open} onClose={handleCancelar} sx={{ padding: 4 }}>
      <div className="absolute top-1/2 md:top-1/3 left-1/2 w-4/5 md:max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-8 shadow-lg font-sans">
        <h2 className="text-center text-xl font-bold mb-2">Sacar sin cargo</h2>
        <p className="text-center text-gray-600 mb-4">
          {`Vehículo ${vehiculo?.patente ?? ""}. La salida sin cargo no genera cobro.`}
        </p>

        <div className="flex flex-col gap-3">
          <label
            className="text-xs font-bold uppercase"
            htmlFor="motivo-sin-cargo"
          >
            Motivo
          </label>
          <TextArea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo de la salida sin cargo"
            name="motivo-sin-cargo"
            disabled={enviando}
          />

          {error && <p className="text-xs text-red-900">{error}</p>}

          <div className="flex w-full gap-2 justify-end mt-2">
            <CallToActionButton
              type="button"
              handleSubmit={handleCancelar}
              disabled={enviando}
            >
              Cancelar
            </CallToActionButton>
            <CallToActionButton
              type="button"
              handleSubmit={handleConfirmar}
              disabled={enviando}
            >
              {enviando ? "Confirmando..." : "Confirmar sin cargo"}
            </CallToActionButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}
