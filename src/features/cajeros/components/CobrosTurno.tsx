import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import { formatCurrency } from "../../../app/utils/money";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import type { CobroConAcarreo, TotalesTurno } from "../../../types/Cobro";
import { obtenerCobrosDeMiTurno } from "../../cobros/services/cobrosService";
import CobroDetalleModal from "./CobroDetalleModal";

const TOTALES_VACIOS: TotalesTurno = {
  cantidad: 0,
  total: 0,
  efectivo: 0,
  mp: 0,
};

/**
 * Cobros del turno de caja abierto (RF21/RF22), en el home del cajero: la
 * lista de lo cobrado en el turno con un "Ver detalle" por cobro. Los datos
 * salen del turno abierto del servidor, no del estado de la sesión.
 */
export default function CobrosTurno() {
  const { token, usuario } = useSelector((state: RootState) => state.auth);

  const [cobros, setCobros] = useState<CobroConAcarreo[]>([]);
  const [totales, setTotales] = useState<TotalesTurno>(TOTALES_VACIOS);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<CobroConAcarreo | null>(null);
  // Al incrementarlo se vuelve a pedir la lista.
  const [refreshKey, setRefreshKey] = useState(0);

  const idTurno = usuario?.Turno_Caja?.id;

  useEffect(() => {
    let activo = true;

    const cargarCobros = async () => {
      if (!token || !idTurno) {
        setCobros([]);
        setTotales(TOTALES_VACIOS);
        return;
      }

      setCargando(true);

      try {
        const res = await obtenerCobrosDeMiTurno(token);
        if (!activo) return;
        setCobros(res.data.cobros);
        setTotales(res.data.totales);
        setError(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (!activo) return;
        setError(
          err.response?.data?.message ||
            "No se pudieron cargar los cobros del turno. Intentá nuevamente más tarde.",
        );
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarCobros();

    return () => {
      activo = false;
    };
  }, [token, idTurno, refreshKey]);

  return (
    <section className="w-full max-w-6xl mt-4 bg-cerulean-100 rounded shadow p-4 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <h2 className="font-bold uppercase">Cobros del turno</h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-xs text-cerulean-800">
            {`${totales.cantidad} cobro(s) · Total ${formatCurrency(totales.total)} (Efectivo ${formatCurrency(totales.efectivo)} + MP ${formatCurrency(totales.mp)})`}
          </p>

          <CallToActionButton
            type="button"
            handleSubmit={() => setRefreshKey((n) => n + 1)}
            disabled={cargando}
          >
            {cargando ? "Actualizando..." : "Actualizar"}
          </CallToActionButton>
        </div>
      </div>

      {error && <p className="text-xs text-scarlet-rush-700">{error}</p>}

      {!error && cobros.length === 0 && (
        <p className="text-xs text-cerulean-800">
          {cargando
            ? "Cargando cobros..."
            : "Todavía no registraste cobros en este turno."}
        </p>
      )}

      {cobros.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full table border-collapse">
            <thead className="bg-cerulean-600 text-white text-left">
              <tr className="text-sm border-b border-cerulean-400">
                <th className="border-r px-2 py-2 border-cerulean-400">
                  Fecha y hora
                </th>
                <th className="border-r px-2 py-2 border-cerulean-400">
                  Patente
                </th>
                <th className="border-r px-2 py-2 border-cerulean-400">
                  Estadías
                </th>
                <th className="border-r px-2 py-2 border-cerulean-400">Total</th>
                <th className="border-r px-2 py-2 border-cerulean-400">
                  Efectivo
                </th>
                <th className="border-r px-2 py-2 border-cerulean-400">
                  Mercado Pago
                </th>
                <th className="border-r px-2 py-2 border-cerulean-400">
                  Factura
                </th>
                <th className="px-2 py-2 border-cerulean-400">Acciones</th>
              </tr>
            </thead>

            <tbody className="bg-cerulean-50 text-xs">
              {cobros.map((cobro) => (
                <tr key={cobro.id}>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    {formatDateFullWithHs(cobro.fecha)}
                  </td>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2 font-bold">
                    {cobro.Acarreo?.Vehiculo?.patente ?? "-"}
                  </td>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    {cobro.estadias ?? "-"}
                  </td>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    {formatCurrency(cobro.total)}
                  </td>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    {formatCurrency(cobro.efectivo)}
                  </td>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    {formatCurrency(cobro.mp)}
                  </td>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    {cobro.numero_factura ?? "-"}
                  </td>
                  <td className="border-b border-cerulean-200 px-2 py-2">
                    <CallToActionButton
                      type="button"
                      handleSubmit={() => setDetalle(cobro)}
                    >
                      Ver detalle
                    </CallToActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CobroDetalleModal
        open={detalle !== null}
        onClose={() => setDetalle(null)}
        cobro={detalle}
      />
    </section>
  );
}
