import { Modal } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "../../../app/utils/money";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import DetailItem from "../../../components/ui/DetailItem";
import TextInput from "../../../components/ui/TextInput";
import { obtenerCobrosDeMiTurno } from "../../cobros/services/cobrosService";
import {
  abrirInformeTurnoCaja,
  cerrarTurno_Caja,
} from "../../usuarios/services/usuariosService";
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

  // Arqueo de cierre (RF14 / CU08): número de sobre y efectivo contado.
  const [numeroSobre, setNumeroSobre] = useState("");
  const [efectivoContado, setEfectivoContado] = useState("");

  // Diferencia entre el efectivo contado y el efectivo esperado (cobrado).
  const diferencia = useMemo(() => {
    if (efectivoContado.trim() === "") return null;
    const contado = Number(efectivoContado);
    if (Number.isNaN(contado)) return null;
    return Math.round((contado - totales.efectivo) * 100) / 100;
  }, [efectivoContado, totales.efectivo]);

  // Cierra el modal limpiando el arqueo cargado, así la próxima apertura arranca
  // con los campos vacíos (sin necesidad de un efecto de reseteo).
  const cerrar = () => {
    setNumeroSobre("");
    setEfectivoContado("");
    setError(null);
    onClose();
  };

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

    // La pestaña del informe se abre ahora (dentro del gesto del usuario) para
    // que el navegador no la bloquee; se llena cuando el turno ya está cerrado.
    const pestania = window.open("", "_blank");

    try {
      await cerrarTurno_Caja(token, turnoCaja.id, {
        numero_sobre: numeroSobre.trim() || null,
        efectivo_contado:
          efectivoContado.trim() === "" ? null : Number(efectivoContado),
      });

      // Informe de cobros del turno, en PDF, para imprimir.
      try {
        await abrirInformeTurnoCaja(token, turnoCaja.id, pestania);
      } catch {
        pestania?.close();
        // El turno igual quedó cerrado: sólo avisamos que no salió el PDF.
        setError(
          "El turno se cerró, pero no se pudo generar el informe en PDF.",
        );
      }

      onSuccess();
      setNumeroSobre("");
      setEfectivoContado("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      pestania?.close();
      const message =
        err.response?.data?.message ||
        "No se pudo cerrar el turno. Intentá nuevamente.";
      setError(message);
    } finally {
      setCerrando(false);
    }
  };

  return (
    <Modal open={open} onClose={cerrar} sx={{ padding: 4 }}>
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

        {/* Arqueo de cierre (RF14 / CU08): lo que rinde el cajero. */}
        <div className="flex flex-col gap-3 border-t border-cerulean-300 pt-3">
          <h3 className="text-sm font-bold uppercase">Arqueo de cierre</h3>

          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold">N° de sobre</span>
            <TextInput
              value={numeroSobre}
              onChange={(e) => setNumeroSobre(e.target.value)}
              placeholder="Ej: 0012"
              name="numero_sobre"
              type="text"
              disabled={cerrando}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold">Efectivo contado</span>
            <TextInput
              value={efectivoContado}
              onChange={(e) => setEfectivoContado(e.target.value)}
              placeholder={formatCurrency(totales.efectivo)}
              name="efectivo_contado"
              type="number"
              disabled={cerrando}
            />
          </label>

          <DetailItem
            etiqueta="Efectivo esperado"
            valor={cargando ? "Cargando..." : formatCurrency(totales.efectivo)}
          />

          {diferencia !== null && (
            <DetailItem
              etiqueta="Diferencia"
              valor={`${formatCurrency(Math.abs(diferencia))} (${
                diferencia > 0 ? "sobrante" : diferencia < 0 ? "faltante" : "sin diferencia"
              })`}
            />
          )}
        </div>

        {error && (
          <p className="text-xs text-scarlet-rush-700 text-center">{error}</p>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-2">
          <CallToActionButton
            type="button"
            handleSubmit={cerrar}
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
