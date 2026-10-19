import { Modal } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { showSuccess } from "../../../app/store/snackbarSlice";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import TextArea from "../../../components/ui/TextArea";
import { agregarIncidencia } from "../../gruas/services/gruasServices";
import { agregarIncidenciaBarrera } from "../../barreras/services/barrerasService";
import { agregarIncidenciaTurnoCaja } from "../../cajeros/services/turnosCajaService";

export type TipoTurno = "caja" | "grua" | "barrera";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Tipo de turno al que pertenece la incidencia (define el endpoint). */
  tipo: TipoTurno;
  /** Turno al que se le agrega o mira la incidencia. */
  turno: { id: string; incidencias?: string | null } | null;
  /** Título del modal (ej: "Incidencia del turno de caja"). */
  titulo?: string;
  /** Texto secundario para identificar el turno (ej: "Caja 2 - Turno Mañana"). */
  descripcion?: string;
  onSuccess?: () => void;
};

const TITULO_POR_TIPO: Record<TipoTurno, string> = {
  caja: "Incidencia del turno de caja",
  grua: "Incidencia del turno de grúa",
  barrera: "Incidencia del turno de barrera",
};

/**
 * Muestra las incidencias ya cargadas de un turno (si tiene) y permite agregar
 * una nueva. Sólo lo puede usar un supervisor (o sistemas); el botón que lo
 * abre se muestra únicamente en los modales de detalle de turno.
 */
export default function AgregarIncidenciaTurnoModal({
  open,
  onClose,
  tipo,
  turno,
  titulo,
  descripcion,
  onSuccess,
}: Props) {
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [incidencia, setIncidencia] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const incidenciasExistentes = turno?.incidencias;

  const handleClose = () => {
    setIncidencia("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!token || !turno) return;

    if (incidencia.trim() === "") {
      setError("La incidencia es obligatoria.");
      return;
    }

    setEnviando(true);
    setError("");

    try {
      if (tipo === "caja") {
        await agregarIncidenciaTurnoCaja(token, turno.id, incidencia.trim());
      } else if (tipo === "barrera") {
        await agregarIncidenciaBarrera(token, turno.id, incidencia.trim());
      } else {
        await agregarIncidencia(token, incidencia.trim(), turno.id);
      }

      dispatch(showSuccess("Incidencia agregada con éxito"));
      handleClose();
      onSuccess?.();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "No se pudo agregar la incidencia.",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} sx={{ padding: 4 }}>
      <div className="absolute top-1/2 left-1/2 w-4/5 md:max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans flex flex-col gap-4">
        <h2 className="text-center text-xl font-bold">
          {titulo ?? TITULO_POR_TIPO[tipo]}
        </h2>

        {descripcion && (
          <p className="text-center text-sm font-semibold text-cerulean-900">
            {descripcion}
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
