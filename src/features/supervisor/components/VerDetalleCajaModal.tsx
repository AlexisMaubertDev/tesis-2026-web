import { Modal } from "@mui/material";
import type { Caja } from "../../../types/Caja";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import { getTurnoLabel } from "../../../app/constants/turnos";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  caja: Caja | null;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full justify-center gap-2 items-center">
      <span className="w-1/2 bg-cerulean-200 text-white px-2 py-1 font-bold rounded">
        {label}:
      </span>
      <span className="w-1/2 bg-cerulean-50 px-2 py-1 rounded">{value}</span>
    </div>
  );
}

export default function VerDetalleCajaModal({ open, setOpen, caja }: Props) {
  const turnoActivo = caja?.turno_caja_activo;
  const cajero = turnoActivo?.Usuario;

  return (
    <Modal open={open} onClose={() => setOpen(false)} sx={{ padding: 4 }}>
      <div className="absolute top-1/2 md:top-1/3 left-1/2 max-w-4/5 md:max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-12 shadow-lg font-sans">
        <h2 className="text-center text-xl font-bold mb-2">
          {`Detalle de la caja N° ${caja?.numero_caja}`}
        </h2>
        <p className="text-center text-gray-600 mb-4">{`Referencia: ${caja?.referencia} - Referencia de pago: ${caja?.referencia_pago}`}</p>

        <div className="flex flex-col justify-center gap-2 pt-4 text-right">
          <Row label="Sucursal" value={caja?.Sucursal?.nombre ?? "-"} />
          <Row
            label="Estado"
            value={turnoActivo ? "Operando" : "Cerrada"}
          />

          {turnoActivo ? (
            <>
              <Row label="Turno" value={getTurnoLabel(turnoActivo.turno)} />
              <Row
                label="Cajero"
                value={
                  cajero
                    ? `${cajero.nombre} ${cajero.apellido}`
                    : "Sin asignar"
                }
              />
              <Row
                label="Apertura"
                value={formatDateFullWithHs(turnoActivo.apertura?.toString())}
              />
            </>
          ) : (
            <Row label="Turno activo" value="Sin turno activo" />
          )}
        </div>

        <div className="flex w-full gap-2 justify-end mt-4">
          <CallToActionButton type="button" handleSubmit={() => setOpen(false)}>
            Cerrar
          </CallToActionButton>
        </div>
      </div>
    </Modal>
  );
}
