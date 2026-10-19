import { Modal } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { showError, showSuccess } from "../../../app/store/snackbarSlice";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import SelectInput from "../../../components/ui/SelectInput";
import TextArea from "../../../components/ui/TextArea";
import type { Grua } from "../../../types/Grua";
import { cambiarEstadoGrua } from "../services/gruasServices";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Grúa a la que se le cambia el estado. */
  grua: Grua | null;
  onSuccess?: () => void;
};

const ESTADOS_GRUA: Grua["estado"][] = [
  "DISPONIBLE",
  "EN_SERVICIO",
  "FUERA_DE_SERVICIO",
  "MANTENIMIENTO",
];

const LABEL_ESTADO: Record<Grua["estado"], string> = {
  DISPONIBLE: "Disponible",
  EN_SERVICIO: "En servicio",
  FUERA_DE_SERVICIO: "Fuera de servicio",
  MANTENIMIENTO: "Mantenimiento",
};

/**
 * Permite al supervisor cambiar el estado de una grúa. No se puede mientras la
 * grúa tenga un turno activo (ese estado lo controla el ciclo del turno).
 */
export default function CambiarEstadoGruaModal({
  open,
  onClose,
  grua,
  onSuccess,
}: Props) {
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  // El padre monta este modal con `key` por grúa, así que el estado arranca
  // siempre desde la grúa seleccionada.
  const [estado, setEstado] = useState<Grua["estado"]>(
    grua?.estado ?? "DISPONIBLE",
  );
  const [observaciones, setObservaciones] = useState(grua?.observaciones ?? "");
  const [enviando, setEnviando] = useState(false);

  const tieneTurnoActivo = Boolean(grua?.turno_grua_activo);

  const handleClose = () => {
    setEnviando(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!token || !grua || tieneTurnoActivo) return;

    if (estado === grua.estado) {
      dispatch(showError("El estado seleccionado es el mismo que el actual."));
      return;
    }

    setEnviando(true);

    try {
      await cambiarEstadoGrua(token, grua.id, { estado, observaciones });
      dispatch(showSuccess("Estado de la grúa actualizado con éxito"));
      handleClose();
      onSuccess?.();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      dispatch(
        showError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "No se pudo cambiar el estado de la grúa.",
        ),
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{ padding: 4 }}
    >
      <div className="absolute top-1/2 left-1/2 w-4/5 md:max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans flex flex-col gap-4">
        <h2 className="text-center text-xl font-bold">Cambiar estado</h2>

        {grua && (
          <p className="text-center text-sm font-semibold text-cerulean-900">
            Grúa {grua.numero} - {grua.patente}
          </p>
        )}

        {tieneTurnoActivo ? (
          <p className="rounded-lg border border-scarlet-rush-300 bg-scarlet-rush-50 p-2 text-center text-xs text-scarlet-rush-900">
            No se puede cambiar el estado de una grúa con un turno activo.
            Finalizá el turno primero.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <h3 className="text-xs font-bold uppercase">Estado</h3>
              <SelectInput
                value={estado}
                onChange={(e) => setEstado(e.target.value as Grua["estado"])}
                placeholder="Seleccioná un estado"
                name="estado"
                options={ESTADOS_GRUA.map((value) => ({
                  value,
                  label: LABEL_ESTADO[value],
                }))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-xs font-bold uppercase">
                Observaciones (opcional)
              </h3>
              <TextArea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Motivo del cambio de estado"
                name="observaciones"
                rows={3}
              />
            </div>
          </>
        )}

        <div className="flex justify-center gap-3">
          <CallToActionButton type="button" handleSubmit={handleClose}>
            Cancelar
          </CallToActionButton>
          <CallToActionButton
            type="button"
            handleSubmit={handleSubmit}
            disabled={enviando || tieneTurnoActivo}
          >
            {enviando ? "Guardando..." : "Guardar"}
          </CallToActionButton>
        </div>
      </div>
    </Modal>
  );
}
