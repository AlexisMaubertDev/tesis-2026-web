import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import type { TurnoCajaCerrado, TurnoCajaDetalle } from "../../../types/TurnoCaja";
import { obtenerDetalleTurnoCaja, obtenerTurnosCerrados } from "../services/turnosCajaService";
import TurnoCajaDetalleModal from "./TurnoCajaDetalleModal";
import VerObservacionesModal from "../../turnos/components/VerObservacionesModal";

export default function TurnosCerradosTable() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [turnos, setTurnos] = useState<TurnoCajaCerrado[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<TurnoCajaDetalle | null>(null);
  const [abriendo, setAbriendo] = useState(false);
  const [observaciones, setObservaciones] = useState<TurnoCajaCerrado | null>(null);

  useEffect(() => {
    if (!token) return;

    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const res = await obtenerTurnosCerrados(token);
        setTurnos(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.response?.data?.message || "No se pudieron cargar los cierres de caja.");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [token]);

  const verDetalle = async (id: string) => {
    if (!token) return;
    setAbriendo(true);
    try {
      const res = await obtenerDetalleTurnoCaja(token, id);
      setDetalle(res.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "No se pudo cargar el detalle.");
    } finally {
      setAbriendo(false);
    }
  };

  return (
    <section className="w-full max-w-6xl mt-4 bg-cerulean-100 rounded shadow p-4 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <h2 className="font-bold uppercase">Cierres de caja (historial)</h2>
      </div>

      {error && <p className="text-xs text-scarlet-rush-700">{error}</p>}
      {cargando && <p className="text-xs text-cerulean-800">Cargando cierres...</p>}

      {!cargando && turnos.length === 0 && (
        <p className="text-xs text-cerulean-800">No hay turnos de caja cerrados para mostrar.</p>
      )}

      {turnos.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full table border-collapse text-xs">
            <thead className="bg-cerulean-600 text-white text-left">
              <tr className="border-b border-cerulean-400">
                <th className="border-r px-2 py-2 border-cerulean-400">Apertura</th>
                <th className="border-r px-2 py-2 border-cerulean-400">Cierre</th>
                <th className="border-r px-2 py-2 border-cerulean-400">Caja</th>
                <th className="border-r px-2 py-2 border-cerulean-400">Referencia</th>
                <th className="border-r px-2 py-2 border-cerulean-400">Usuario</th>
                <th className="border-r px-2 py-2 border-cerulean-400">Turno</th>
                <th className="px-2 py-2 border-cerulean-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-cerulean-50">
              {turnos.map((t) => (
                <tr key={t.id}>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    {formatDateFullWithHs(t.apertura)}
                  </td>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    {t.cierre ? formatDateFullWithHs(t.cierre) : "-"}
                  </td>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    {t.Caja?.numero_caja ?? "-"}
                  </td>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    {t.Caja?.referencia ?? "-"}
                  </td>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    {t.Usuario ? `${t.Usuario.nombre} ${t.Usuario.apellido}` : "-"}
                  </td>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    {t.turno}
                  </td>
                  <td className="border-b border-cerulean-200 px-2 py-2">
                    <div className="flex gap-2">
                      <CallToActionButton
                        type="button"
                        handleSubmit={() => verDetalle(t.id)}
                        disabled={abriendo}
                      >
                        Ver detalle
                      </CallToActionButton>
                      {t.observaciones && (
                        <CallToActionButton
                          type="button"
                          handleSubmit={() => setObservaciones(t)}
                          className="whitespace-nowrap"
                        >
                          Ver observación
                        </CallToActionButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TurnoCajaDetalleModal
        open={detalle !== null}
        onClose={() => setDetalle(null)}
        detalle={detalle}
        onRefrescar={() => detalle && verDetalle(detalle.turno.id)}
      />

      <VerObservacionesModal
        open={observaciones !== null}
        onClose={() => setObservaciones(null)}
        observaciones={observaciones?.observaciones}
        descripcion={
          observaciones
            ? `Caja ${observaciones.Caja?.numero_caja ?? "-"} · Turno ${observaciones.turno}`
            : undefined
        }
      />
    </section>
  );
}
