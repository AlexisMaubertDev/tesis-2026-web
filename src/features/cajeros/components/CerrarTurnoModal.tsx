import { Modal } from "@mui/material";
import { useEffect, useState } from "react";
import { formatCurrency } from "../../../app/utils/money";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import DetailItem from "../../../components/ui/DetailItem";
import { obtenerCobrosDeMiTurno } from "../../cobros/services/cobrosService";
import { cerrarTurno_Caja } from "../../usuarios/services/usuariosService";
import { getTurnoLabel } from "../../../app/constants/turnos";
import type { TotalesTurno } from "../../../types/Cobro";

type TurnoCaja = {
  id: string;
  turno: string;
  apertura?: string | Date | null;
  Caja?: {
    numero_caja: number;
    referencia: string;
  } | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  turnoCaja: TurnoCaja | null;
  token: string | null;
  onSuccess: () => void;
};

/**
 * Modal para confirmar el cierre del turno de caja. Muestra un resumen con
 * la cantidad de cobros y los totales (efectivo + Mercado Pago) antes de
 * cerrarlo.
 */
export default function CerrarTurnoModal({
  open,
  onClose,
  turnoCaja,
  token,
  onSuccess,
}: Props) {
  const [totales, setTotales] = useState<TotalesTurno>({
    cantidad: 0,
    total: 0,
    efectivo: 0,
    mp: 0,
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cerrando, setCerrando] = useState(false);

  useEffect(() => {
    if (!open || !token) return;

    let activo = true;

    const cargarResumen = async () => {
      setCargando(true);
      setError(null);

      try {
        const res = await obtenerCobrosDeMiTurno(token);
        if (!activo) return;
        setTotales(res.data.totales);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (!activo) return;
        setError(
          err.response?.data?.message ||
            "No se pudo obtener el resumen del turno. Podés cerrar de todas formas.",
        );
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarResumen();

    return () => {
      activo = false;
    };
  }, [open, token]);

  const handleCerrar = async () => {
    if (!token || !turnoCaja?.id) return;

    setCerrando(true);
    setError(null);

    try {
      await cerrarTurno_Caja(token, turnoCaja.id);
      onSuccess();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "No se pudo cerrar el turno. Intentá nuevamente.";
      setError(message);
    } finally {
      setCerrando(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} sx={{ padding: 4 }}>
      <div className="absolute top-1/2 md:top-1/3 left-1/2 w-4/5 md:max-w-md max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-8 shadow-lg font-sans flex flex-col gap-4">
        <h2 className="text-center text-xl font-bold">Cerrar turno de caja</h2>

        <div className="flex flex-col gap-2">
          <DetailItem
            etiqueta="Caja"
            valor={turnoCaja?.Caja?.numero_caja ?? "-"}
          />
          <DetailItem
            etiqueta="Referencia"
            valor={turnoCaja?.Caja?.referencia ?? "-"}
          />
          <DetailItem
            etiqueta="Turno"
            valor={turnoCaja?.turno ? getTurnoLabel(turnoCaja.turno) : "-"}
          />
          <DetailItem
            etiqueta="Cobros registrados"
            valor={cargando ? "Cargando..." : String(totales.cantidad)}
          />
          <DetailItem
            etiqueta="Total"
            valor={cargando ? "Cargando..." : formatCurrency(totales.total)}
          />
          <DetailItem
            etiqueta="Efectivo"
            valor={cargando ? "Cargando..." : formatCurrency(totales.efectivo)}
          />
          <DetailItem
            etiqueta="Mercado Pago"
            valor={cargando ? "Cargando..." : formatCurrency(totales.mp)}
          />
        </div>

        {error && (
          <p className="text-xs text-scarlet-rush-700 text-center">{error}</p>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-2">
          <CallToActionButton
            type="button"
            handleSubmit={onClose}
            disabled={cerrando}
          >
            Cancelar
          </CallToActionButton>
          <CallToActionButton
            type="button"
            handleSubmit={handleCerrar}
            disabled={cerrando}
          >
            {cerrando ? "Cerrando..." : "Cerrar turno"}
          </CallToActionButton>
        </div>
      </div>
    </Modal>
  );
}
