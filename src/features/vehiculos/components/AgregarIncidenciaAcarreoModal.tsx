import { Modal } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { showSuccess } from "../../../app/store/snackbarSlice";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import TextArea from "../../../components/ui/TextArea";
import { agregarIncidenciaAcarreo } from "../services/vehiculosService";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Acarreo (vehículo) al que se le agrega o mira la incidencia. */
  acarreo: { id: string; patente?: string | null } | null;
  /** Título del modal (ej: "Incidencia acarreo", "Incidencias entrada"). */
  titulo?: string;
  /** Incidencias ya cargadas en el acarreo (si tiene, se muestran). */
  incidenciasExistentes?: string | null;
  onSuccess?: () => void;
};

/**
 * Muestra las incidencias de un acarreo (si tiene) y permite agregar una nueva.
 * Sólo la puede usar un supervisor (o sistemas); el botón que lo abre se muestra
 * únicamente para esos roles.
 */
export default function AgregarIncidenciaAcarreoModal({
  open,
  onClose,
  acarreo,
  titulo = "Incidencia acarreo",
  incidenciasExistentes,
  onSuccess,
}: Props) {
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [incidencia, setIncidencia] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setIncidencia("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!token || !acarreo) return;

    if (incidencia.trim() === "") {
      setError("La incidencia es obligatoria.");
      return;
    }

    setEnviando(true);
    setError("");

    try {
      await agregarIncidenciaAcarreo(token, acarreo.id, incidencia.trim());
      dispatch(showSuccess("Incidencia agregada con éxito"));
      handleClose();
      onSuccess?.();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.message || "No se pudo agregar la incidencia.",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} sx={{ padding: 4 }}>
      <div className="absolute top-1/2 left-1/2 w-4/5 md:max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans flex flex-col gap-4">
        <h2 className="text-center text-xl font-bold">{titulo}</h2>

        {acarreo?.patente && (
          <p className="text-center text-sm font-semibold text-cerulean-900">
            {acarreo.patente}
          </p>
        )}

        {incidenciasExistentes && (
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-bold uppercase">Incidencias</h3>
            <p className="text-xs whitespace-pre-line rounded-lg border border-cerulean-300 bg-cerulean-50 p-2">
              {incidenciasExistentes}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <h3 className="text-xs font-bold uppercase">
            {incidenciasExistentes ? "Agregar incidencia" : "Incidencia"}
          </h3>
          <TextArea
            value={incidencia}
            onChange={(e) => setIncidencia(e.target.value)}
            placeholder="Describí la incidencia"
            name="incidencia"
          />
        </div>

        {error && (
          <p className="text-xs text-scarlet-rush-700 text-center">{error}</p>
        )}

        <div className="flex justify-center gap-3">
          <CallToActionButton type="button" handleSubmit={handleClose}>
            Cancelar
          </CallToActionButton>
          <CallToActionButton
            type="button"
            handleSubmit={handleSubmit}
            disabled={enviando}
          >
            {enviando ? "Agregando..." : "Agregar"}
          </CallToActionButton>
        </div>
      </div>
    </Modal>
  );
}
