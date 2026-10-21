import { Modal } from "@mui/material";
import CallToActionButton from "../../../components/ui/CallToActionButton";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Observaciones acumuladas del turno. */
  observaciones: string | null | undefined;
  /** Título del modal (ej: "Observaciones del turno de caja"). */
  titulo?: string;
  /** Texto secundario para identificar el turno (ej: "Caja 2 · Turno Mañana"). */
  descripcion?: string;
};

/**
 * Muestra (sólo lectura) las observaciones cargadas por el cajero al cerrar el
 * turno. Mismo patrón que el modal de incidencias, pero sin carga: se abre desde
 * el detalle del turno y desde las tablas de turnos de caja.
 */
export default function VerObservacionesModal({
  open,
  onClose,
  observaciones,
  titulo,
  descripcion,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} sx={{ padding: 4 }}>
      <div className="absolute top-1/2 left-1/2 w-4/5 md:max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans flex flex-col gap-4">
        <h2 className="text-center text-xl font-bold">
          {titulo ?? "Observaciones del turno"}
        </h2>

        {descripcion && (
          <p className="text-center text-sm font-semibold text-cerulean-900">
            {descripcion}
          </p>
        )}

        <p className="text-xs whitespace-pre-line rounded-lg border border-cerulean-300 bg-cerulean-50 p-3">
          {observaciones || "El turno no tiene observaciones."}
        </p>

        <div className="flex justify-center">
          <CallToActionButton type="button" handleSubmit={onClose}>
            Cerrar
          </CallToActionButton>
        </div>
      </div>
    </Modal>
  );
}
