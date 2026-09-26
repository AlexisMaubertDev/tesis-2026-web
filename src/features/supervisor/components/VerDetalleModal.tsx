import { Modal } from "@mui/material";
import type { Grua } from "../../../types/Grua";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import { useState } from "react";
import TextArea from "../../../components/ui/TextArea";
import { agregarIncidencia } from "../../gruas/services/gruasServices";
import type { RootState } from "../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { showSuccess } from "../../../app/store/snackbarSlice";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  grua: Grua | null;
  onSuccess?: () => void;
};

export default function VerDetalleModal({
  open,
  setOpen,
  grua,
  onSuccess,
}: Props) {
  const DEFAULT_TIMEZONE = "America/Argentina/Buenos_Aires";

  function formatDateFullWithHs(dateString: string | null | undefined): string {
    if (!dateString) return "";
    const date = toZonedTime(new Date(dateString), DEFAULT_TIMEZONE);
    return `${format(date, "dd/MM/yyyy HH:mm", { locale: es })}hs`;
  }
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const incidenciasPrevias = grua?.turno_grua_activo?.incidencias || "";

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
        await agregarIncidencia(
          token!,
          nuevaIncidencia,
          grua?.turno_grua_activo?.id || "",
        );

        setAgregandoIncidencia(false);
        setNuevaIncidencia("");
        onSuccess!();
        dispatch(showSuccess("Incidencia agregada con exito"));
      } catch (error: { response: { data: { error: string } } }) {
        setErrorIncidencia(
          error?.response?.data?.error || "Error al agregar incidencia",
        );
      }
    }
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} sx={{ padding: 4 }}>
      <div className="absolute top-1/2 md:top-1/3 left-1/2  max-w-4/5 md:max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-12 shadow-lg font-sans">
        <h2 className="text-center text-xl font-bold mb-2">
          {`Detalle de la grúa ${grua?.numero}`}
        </h2>
        <p className="text-center text-gray-600 mb-4">{`Patente: ${grua?.patente} - Modelo: ${grua?.modelo}`}</p>
        <div className="flex flex-col justify-center gap-2 pt-4 text-right">
          <div className="flex w-full justify-center gap-2 items-center min-w-md">
            <span className="w-1/2 bg-cerulean-200 text-white px-2 py-1 font-bold rounded">
              Chofer:
            </span>
            <span className="w-1/2 bg-cerulean-50 px-2 py-1 rounded">
              {grua?.turno_grua_activo?.chofer?.nombre +
                " " +
                grua?.turno_grua_activo?.chofer?.apellido}
            </span>
          </div>
          <div className="flex w-full justify-center gap-2 items-center">
            <span className="w-1/2 bg-cerulean-200 text-white px-2 py-1 font-bold rounded">
              Enganchador:
            </span>
            <span className="w-1/2 bg-cerulean-50 px-2 py-1 rounded">
              {grua?.turno_grua_activo?.enganchador?.nombre +
                " " +
                grua?.turno_grua_activo?.enganchador?.apellido}
            </span>
          </div>
          <div className="flex w-full justify-center gap-2 items-center">
            <span className="w-1/2 bg-cerulean-200 text-white px-2 py-1 font-bold rounded">
              Agente:
            </span>
            <span className="w-1/2 bg-cerulean-50 px-2 py-1 rounded">
              {grua?.turno_grua_activo?.nombre_agente}
            </span>
          </div>
          <div className="flex w-full justify-center gap-2 items-center">
            <span className="w-1/2 bg-cerulean-200 text-white px-2 py-1 font-bold rounded">
              Hora inicio:
            </span>
            <span className="w-1/2 bg-cerulean-50 px-2 py-1 rounded">
              {formatDateFullWithHs(grua?.turno_grua_activo?.fecha_inicio)}
            </span>
          </div>
          <div className="flex w-full justify-center gap-2 items-center">
            <span className="w-1/2 bg-cerulean-200 text-white px-2 py-1 font-bold rounded self-start">
              Observaciones:
            </span>
            <span className="w-1/2 bg-cerulean-50 px-2 py-1 min-h-30 rounded ">
              {grua?.turno_grua_activo?.observaciones
                ? grua?.turno_grua_activo?.observaciones
                : "Ninguna"}
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
              <span className="w-1/2 bg-cerulean-50 px-2 py-1 min-h-30 rounded whitespace-pre-wrap">
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
