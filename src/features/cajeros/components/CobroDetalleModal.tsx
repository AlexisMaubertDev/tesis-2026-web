import { Modal } from "@mui/material";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import { formatCurrency } from "../../../app/utils/money";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import DetailItem from "../../../components/ui/DetailItem";
import type { CobroConAcarreo } from "../../../types/Cobro";

type Props = {
  open: boolean;
  onClose: () => void;
  cobro: CobroConAcarreo | null;
};

/**
 * Detalle de un cobro (RF22): el vehículo, las fechas del cobro y del acarreo,
 * las estadías y cómo se pagó. Se abre desde la lista de cobros del turno.
 */
export default function CobroDetalleModal({ open, onClose, cobro }: Props) {
  const acarreo = cobro?.Acarreo ?? null;
  const vehiculo = acarreo?.Vehiculo ?? null;

  const descripcionVehiculo = vehiculo
    ? [vehiculo.marca, vehiculo.modelo, vehiculo.color]
        .filter(Boolean)
        .join(" - ")
    : "-";

  return (
    <Modal open={open} onClose={onClose} sx={{ padding: 4 }}>
      <div className="absolute top-1/2 md:top-1/3 left-1/2 w-4/5 md:max-w-2xl max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-8 shadow-lg font-sans">
        <h2 className="text-center text-xl font-bold">Detalle del cobro</h2>
        <p className="text-center text-sm font-bold text-cerulean-900 mb-4">
          {vehiculo?.patente ?? "Sin patente"}
        </p>

        <div className="flex flex-col gap-2">
          <DetailItem
            etiqueta="Fecha y hora del cobro"
            valor={cobro ? formatDateFullWithHs(cobro.fecha) : "-"}
          />
          <DetailItem etiqueta="Vehículo" valor={descripcionVehiculo} />
          <DetailItem
            etiqueta="Fecha y hora del acarreo"
            valor={
              acarreo?.fecha_acarreo
                ? formatDateFullWithHs(acarreo.fecha_acarreo)
                : "-"
            }
          />
          <DetailItem
            etiqueta="Estadías"
            valor={cobro?.estadias != null ? String(cobro.estadias) : "-"}
          />
          <DetailItem
            etiqueta="Total"
            valor={formatCurrency(cobro?.total)}
          />
          <DetailItem
            etiqueta="Efectivo"
            valor={formatCurrency(cobro?.efectivo)}
          />
          <DetailItem
            etiqueta="Mercado Pago"
            valor={formatCurrency(cobro?.mp)}
          />
          <DetailItem
            etiqueta="N° de factura"
            valor={cobro?.numero_factura ?? "Sin factura"}
          />
          <DetailItem etiqueta="Dirección" valor={acarreo?.direccion ?? "-"} />
          <DetailItem etiqueta="Motivo" valor={acarreo?.motivo ?? "-"} />
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
