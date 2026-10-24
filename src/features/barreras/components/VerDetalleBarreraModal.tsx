import { Modal } from "@mui/material";
import type { Barrera } from "../../../types/Barrera";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import { useState } from "react";
import TextArea from "../../../components/ui/TextArea";
import {
  agregarIncidenciaBarrera,
  finalizarTurnoBarrera,
} from "../../barreras/services/barrerasService";
import { abrirInformeTurnoBarrera } from "../../barreras/services/turnosBarreraService";
import type { RootState } from "../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { showError, showSuccess } from "../../../app/store/snackbarSlice";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  barrera: Barrera | null;
  onSuccess?: () => void;
};

export default function VerDetalleBarreraModal({
  open,
  setOpen,
  barrera,
  onSuccess,
}: Props) {
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const turno = barrera?.turno_barrera_activo ?? null;
  const incidenciasPrevias = turno?.incidencias || "";

  const [nuevaIncidencia, setNuevaIncidencia] = useState("");
  const [agregandoIncidencia, setAgregandoIncidencia] = useState(false);
  const [errorIncidencia, setErrorIncidencia] = useState("");

  const handleAgregarIncidencias = async () => {
    setErrorIncidencia("");
    if (!agregandoIncidencia) {
      setAgregandoIncidencia(true);
      return;
    } else {
      if (!nuevaIncidencia.trim()) {
        return setErrorIncidencia("Debe ingresar una incidencia");
      }
      try {
        await agregarIncidenciaBarrera(token!, turno?.id || "", nuevaIncidencia);
        setAgregandoIncidencia(false);
        setNuevaIncidencia("");
        onSuccess?.();
        dispatch(showSuccess("Incidencia agregada con éxito"));
      } catch (error) {
        const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
        setErrorIncidencia(msg || "Error al agregar incidencia");
      }
    }
  };

  const handleTerminarTurno = async () => {
    const idTurno = turno?.id;

    // RF15: el informe del turno de barrera se emite solo al cerrarlo. La
    // pestaña se abre antes del pedido para no perder el gesto del usuario.
    const pestania = window.open("", "_blank");

    try {
      await finalizarTurnoBarrera(token!, idTurno || "");
    } catch (error) {
      pestania?.close();
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setErrorIncidencia(msg || "Error al terminar el turno");
      return;
    }

    onSuccess?.();
    dispatch(showSuccess("Turno finalizado con éxito"));

    if (!idTurno) {
      pestania?.close();
      return;
    }

    try {
      await abrirInformeTurnoBarrera(
        token!,
        idTurno,
        pestania,
        `informe-turno-barrera-${barrera?.ubicacion ?? idTurno}.pdf`,
      );
    } catch {
      dispatch(
        showError("El turno se cerró, pero no se pudo generar el informe"),
      );
    }
  };

  const playeros = turno?.usuarios_asignados?.map((ua) => ua.Usuario) ?? [];

  return (
    <Modal open={open} onClose={() => setOpen(false)} sx={{ padding: 4 }}>
      <div className="absolute top-1/2 md:top-1/3 left-1/2 max-w-4/5 md:max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-12 shadow-lg font-sans">
        <h2 className="text-center text-xl font-bold mb-2">
          {`Detalle de la barrera ${barrera?.ubicacion}`}
        </h2>
        <p className="text-center text-gray-600 mb-4">
          {`Sucursal: ${barrera?.Sucursal?.nombre}`}
        </p>
        <div className="flex flex-col justify-center gap-2 pt-4 text-right">
          <div className="flex w-full justify-center gap-2 items-center">
            <span className="w-1/2 bg-cerulean-200 text-white px-2 py-1 font-bold rounded">
              Turno:
            </span>
            <span className="w-1/2 bg-cerulean-50 px-2 py-1 rounded">
              {turno ? turno.turno : "Sin turno activo"}
            </span>
          </div>
          <div className="flex w-full justify-center gap-2 items-center">
            <span className="w-1/2 bg-cerulean-200 text-white px-2 py-1 font-bold rounded">
              Hora inicio:
            </span>
            <span className="w-1/2 bg-cerulean-50 px-2 py-1 rounded">
              {turno ? formatDateFullWithHs(turno.fecha_inicio) : "-"}
            </span>
          </div>
          <div className="flex w-full justify-center gap-2 items-start">
            <span className="w-1/2 bg-cerulean-200 text-white px-2 py-1 font-bold rounded self-start">
              Playeros asignados:
            </span>
            <span className="w-1/2 bg-cerulean-50 px-2 py-1 rounded min-h-[40px]">
              {playeros.length
                ? playeros.map((p) => `${p.nombre} ${p.apellido}`).join(", ")
                : "Ninguno"}
            </span>
          </div>
          <div className="flex w-full justify-center gap-2 items-center">
            <span className="w-1/2 bg-cerulean-200 text-white px-2 py-1 font-bold rounded self-start">
              Incidencias:
            </span>
            {agregandoIncidencia ? (
              <div className="w-1/2 flex flex-col gap-2">
                {incidenciasPrevias && (
                  <div className="bg-gray-100 p-2 rounded text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto border border-gray-300">
                    {incidenciasPrevias}
                  </div>
                )}
                <TextArea
                  value={nuevaIncidencia}
                  onChange={(e) => setNuevaIncidencia(e.target.value)}
                  placeholder="Escriba la nueva incidencia aquí..."
                  name="incidencia"
                  rows={3}
                />
              </div>
            ) : (
              <span className="w-1/2 bg-cerulean-50 px-2 py-1 min-h-10 rounded whitespace-pre-wrap">
                {incidenciasPrevias ? incidenciasPrevias : "Ninguna"}
              </span>
            )}
          </div>
          <p className="text-xs text-red-600">{errorIncidencia}</p>

          <div className="flex w-full gap-2 justify-end mt-4">
            <CallToActionButton
              type="button"
              handleSubmit={() => handleAgregarIncidencias()}
            >
              Agregar incidencia
            </CallToActionButton>
            {turno && (
              <CallToActionButton
                type="button"
                handleSubmit={handleTerminarTurno}
              >
                Terminar este turno
              </CallToActionButton>
            )}
            <CallToActionButton
              type="button"
              handleSubmit={() => setOpen(false)}
            >
              Cerrar
            </CallToActionButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}