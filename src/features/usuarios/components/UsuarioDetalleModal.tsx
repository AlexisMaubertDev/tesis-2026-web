import Modal from "@mui/material/Modal";
import { getTurnoLabel } from "../../../app/constants/turnos";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import DetailItem from "../../../components/ui/DetailItem";
import type { Usuario } from "../../../types/Usuario";

type Props = {
  open: boolean;
  onClose: () => void;
  usuario: Usuario | null;
};

export default function UsuarioDetalleModal({
  open,
  onClose,
  usuario,
}: Props) {
  const turnoCaja = usuario?.turno_caja_activo ?? null;
  const caja = turnoCaja?.Caja ?? null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans">
        <h2 className="text-center font-bold uppercase">
          {`Detalle de ${usuario?.nombre ?? ""} ${usuario?.apellido ?? ""}`.trim()}
        </h2>

        <div className="flex flex-col gap-2 mt-4">
          <h3 className="text-sm font-bold uppercase mt-2">Datos</h3>
          <DetailItem etiqueta="Nombre" valor={usuario?.nombre} />
          <DetailItem etiqueta="Apellido" valor={usuario?.apellido} />
          <DetailItem etiqueta="Legajo" valor={usuario?.legajo} />
          <DetailItem etiqueta="DNI" valor={usuario?.dni} />
          <DetailItem etiqueta="Email" valor={usuario?.email} />
          <DetailItem etiqueta="Rol" valor={usuario?.rol} />
          <DetailItem etiqueta="Sucursal" valor={usuario?.Sucursal?.nombre} />
          <DetailItem
            etiqueta="Dirección de la sucursal"
            valor={usuario?.Sucursal?.direccion}
          />
          <DetailItem
            etiqueta="Número de turno"
            valor={
              usuario?.numero_turno != null
                ? getTurnoLabel(String(usuario.numero_turno))
                : "-"
            }
          />
          <DetailItem
            etiqueta="Trabaja domingos"
            valor={usuario?.trabaja_domingo ? "Sí" : "No"}
          />
          <DetailItem
            etiqueta="Bloqueado"
            valor={usuario?.bloqueado ? "Sí" : "No"}
          />
          <DetailItem
            etiqueta="Intentos restantes"
            valor={String(usuario?.intentos_restantes ?? "-")}
          />
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <h3 className="text-sm font-bold uppercase">Turno de caja activo</h3>

          {!turnoCaja && (
            <p className="text-xs text-cerulean-700">
              Este usuario no tiene un turno de caja abierto.
            </p>
          )}

          {turnoCaja && (
            <>
              <DetailItem
                etiqueta="Turno"
                valor={getTurnoLabel(turnoCaja.turno)}
              />
              <DetailItem etiqueta="Caja" valor={caja?.numero_caja} />
              <DetailItem etiqueta="Referencia" valor={caja?.referencia} />
              <DetailItem
                etiqueta="Sucursal de la caja"
                valor={caja?.Sucursal?.nombre}
              />
              <DetailItem
                etiqueta="Apertura"
                valor={formatDateFullWithHs(turnoCaja.apertura)}
              />
            </>
          )}
        </div>

        <div className="flex justify-center mt-6">
          <CallToActionButton type="button" handleSubmit={onClose}>
            Cerrar
          </CallToActionButton>
        </div>
      </div>
    </Modal>
  );
}
