import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import type { Caja } from "../../../types/Caja";
import { useState } from "react";
import ChoiceModal from "../../../components/ui/ChoiceModal";
import { empezarTurno_Caja } from "../../usuarios/services/usuariosService";
import { empezarTurnoCaja } from "../../../app/store/authSlice";
import { Modal, Tooltip } from "@mui/material";
import SelectInput from "../../../components/ui/SelectInput";
import { showError, showSuccess } from "../../../app/store/snackbarSlice";
import CircleIcon from "@mui/icons-material/Circle";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import { getTurnoLabel, TURNOS_OPTIONS } from "../../../app/constants/turnos";

type Props = {
  cajas: Caja[];
};

export default function SelectCajas({ cajas }: Props) {
  const { token } = useSelector((state: RootState) => state.auth);
  const [cajaSeleccionada, setCajaSeleccionada] = useState<Caja | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [turnoModalOpen, setTurnoModalOpen] = useState(false);
  const [turno, setTurno] = useState<string>("");
  const dispatch = useDispatch();

  const handleEmpezarTurno = async () => {
    if (!cajaSeleccionada) return;
    try {
      const res = await empezarTurno_Caja(token!, {
        id_caja: cajaSeleccionada.id!,
        turno,
      });

      dispatch(empezarTurnoCaja(res.data));
      dispatch(showSuccess("Turno iniciado correctamente"));

      handleCloseModal(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error.response?.data);
      dispatch(showError(error.response?.data?.message));
    }
  };

  const handleSeleccionarCaja = async (caja: Caja) => {
    setCajaSeleccionada(caja);
    setModalOpen(true);
  };
  const handleCloseModal = (value: boolean) => {
    setModalOpen(value);
    setCajaSeleccionada(null);
    setTurnoModalOpen(false);
    setTurno("");
  };

  return (
    <ul className="flex  justify-start items-start lg:items-center w-full  gap-4">
      {cajas.map((caja) => (
        <li
          key={caja.id}
          className="flex  bg-cerulean-200 rounded shadow p-4 w-full sm:w-auto"
        >
          <div className="flex flex-col gap-2">
            <span className="font-bold">Caja N°: {caja.numero_caja}</span>
            <p>
              <span className="font-bold mr-1">Referencia:</span>
              {caja.referencia}
            </p>
            {caja.turno_caja_activo ? (
              <span className=" font-bold">
                {`${getTurnoLabel(caja.turno_caja_activo.turno)} - ${formatDateFullWithHs(
                  caja.turno_caja_activo?.apertura.toString(),
                )}`}
              </span>
            ) : (
              <CallToActionButton
                type="button"
                handleSubmit={() => handleSeleccionarCaja(caja)}
              >
                Empezar turno
              </CallToActionButton>
            )}
          </div>
          <div className="-mr-2 -mt-2">
            <Tooltip title={caja.turno_caja_activo ? "Operando" : "Cerrada"}>
              <CircleIcon
                className={
                  caja.turno_caja_activo ? "text-green-500" : "text-red-500"
                }
                fontSize="small"
              />
            </Tooltip>
          </div>
        </li>
      ))}
      <ChoiceModal
        open={modalOpen}
        setOpen={handleCloseModal}
        title="¿Desea empezar el turno en esta caja?"
        confirm={() => {
          setModalOpen(false);
          setTurnoModalOpen(true);
        }}
        cancel={() => handleCloseModal(false)}
        subtitle={`Caja N°: ${cajaSeleccionada?.numero_caja} - Referencia: ${cajaSeleccionada?.referencia}`}
        disabled={false}
      />
      <Modal open={turnoModalOpen} onClose={() => setTurnoModalOpen(false)}>
        <div className="absolute flex flex-col gap-2 top-1/2 md:top-1/3 left-1/2  max-w-4/5 md:max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-12 shadow-lg font-sans">
          <h2 className="text-xl font-bold mb-2">Seleccionar Turno</h2>
          <SelectInput
            name="turno"
            placeholder="Turno"
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            options={TURNOS_OPTIONS}
          />

          <CallToActionButton type="button" handleSubmit={handleEmpezarTurno}>
            Empezar Turno
          </CallToActionButton>
        </div>
      </Modal>
    </ul>
  );
}
