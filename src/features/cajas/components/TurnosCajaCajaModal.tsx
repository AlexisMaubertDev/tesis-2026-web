import { Modal } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import {
  enRangoDeFechas,
  formatDateFullWithHs,
} from "../../../app/hooks/dataParse";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import FiltroFechas from "../../../components/ui/FiltroFechas";
import type { Caja } from "../../../types/Caja";
import type { TurnoCajaCerrado, TurnoCajaDetalle } from "../../../types/TurnoCaja";
import {
  obtenerDetalleTurnoCaja,
  obtenerTurnosDeCaja,
} from "../../cajeros/services/turnosCajaService";
import { abrirInformeTurnoCaja } from "../../usuarios/services/usuariosService";
import TurnoCajaDetalleModal from "../../cajeros/components/TurnoCajaDetalleModal";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Caja cuyo historial de turnos se muestra. */
  caja: Caja | null;
};

/**
 * Historial de turnos (el actual y los anteriores) de una caja, con el cajero
 * de cada turno y un botón para ver el detalle (ahí el supervisor puede
 * agregar/mirar las incidencias del turno). Se puede acotar por fecha
 * (desde/hasta). Es el modal que se abre desde la tabla de cajas.
 */
export default function TurnosCajaCajaModal({ open, onClose, caja }: Props) {
  const { token } = useSelector((state: RootState) => state.auth);

  const [turnos, setTurnos] = useState<TurnoCajaCerrado[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<TurnoCajaDetalle | null>(null);
  const [abriendoDetalle, setAbriendoDetalle] = useState(false);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [generando, setGenerando] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !token || !caja?.id) return;

    let activo = true;

    const cargar = async () => {
      setCargando(true);
      setError(null);

      try {
        const res = await obtenerTurnosDeCaja(token, caja.id);
        if (!activo) return;
        setTurnos(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (!activo) return;
        setError(
          err.response?.data?.message ||
            "No se pudieron cargar los turnos de la caja.",
        );
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [open, token, caja?.id]);

  // Al cerrar limpiamos los filtros.
  const cerrar = () => {
    setDesde("");
    setHasta("");
    onClose();
  };

  const verDetalle = async (id: string) => {
    if (!token) return;

    setAbriendoDetalle(true);

    try {
      const res = await obtenerDetalleTurnoCaja(token, id);
      setDetalle(res.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "No se pudo cargar el detalle del turno de caja.",
      );
    } finally {
      setAbriendoDetalle(false);
    }
  };

  // Informe consolidado del turno (RF15 / CU13): PDF en otra pestaña.
  const verInforme = async (id: string) => {
    if (!token) return;

    setGenerando(id);

    try {
      await abrirInformeTurnoCaja(token, id);
    } catch {
      setError("No se pudo generar el informe del turno.");
    } finally {
      setGenerando(null);
    }
  };

  const turnosFiltrados = turnos.filter((t) =>
    enRangoDeFechas(t.apertura, desde, hasta),
  );

  return (
    <>
      <Modal open={open} onClose={cerrar} sx={{ padding: 4 }}>
        <div className="absolute top-1/2 left-1/2 w-4/5 md:max-w-3xl max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans flex flex-col gap-4">
          <h2 className="text-center text-xl font-bold">
            Turnos de la caja {caja?.numero_caja}
          </h2>

          {caja && (
            <p className="text-center text-sm font-semibold text-cerulean-900">
              {caja.referencia} · {caja.Sucursal?.nombre}
            </p>
          )}

          <FiltroFechas
            desde={desde}
            hasta={hasta}
            setDesde={setDesde}
            setHasta={setHasta}
          />

          {error && (
            <p className="text-xs text-scarlet-rush-700 text-center">{error}</p>
          )}

          {cargando && (
            <p className="text-xs text-cerulean-800 text-center">
              Cargando turnos...
            </p>
          )}

          {!cargando && turnosFiltrados.length === 0 && (
            <p className="text-xs text-cerulean-800 text-center">
              {turnos.length === 0
                ? "Esta caja no tiene turnos."
                : "No hay turnos en el rango de fechas seleccionado."}
            </p>
          )}

          {turnosFiltrados.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full table border-collapse text-xs">
                <thead className="bg-cerulean-600 text-white text-left">
                  <tr className="border-b border-cerulean-400">
                    <th className="border-r px-2 py-1 border-cerulean-400">
                      Turno
                    </th>
                    <th className="border-r px-2 py-1 border-cerulean-400">
                      Cajero
                    </th>
                    <th className="border-r px-2 py-1 border-cerulean-400">
                      Apertura
                    </th>
                    <th className="border-r px-2 py-1 border-cerulean-400">
                      Cierre
                    </th>
                    <th className="border-r px-2 py-1 border-cerulean-400">
                      Estado
                    </th>
                    <th className="border-r px-2 py-1 border-cerulean-400">
                      Cobros
                    </th>
                    <th className="px-2 py-1 border-cerulean-400">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-cerulean-50">
                  {turnosFiltrados.map((t) => (
                    <tr key={t.id}>
                      <td className="border-r border-b border-cerulean-200 px-2 py-1">
                        {t.turno || "-"}
                      </td>
                      <td className="border-r border-b border-cerulean-200 px-2 py-1">
                        {t.Usuario
                          ? `${t.Usuario.nombre} ${t.Usuario.apellido}`
                          : "-"}
                      </td>
                      <td className="border-r border-b border-cerulean-200 px-2 py-1">
                        {formatDateFullWithHs(t.apertura)}
                      </td>
                      <td className="border-r border-b border-cerulean-200 px-2 py-1">
                        {t.cierre ? formatDateFullWithHs(t.cierre) : "-"}
                      </td>
                      <td className="border-r border-b border-cerulean-200 px-2 py-1">
                        {t.activo ? "Abierto" : "Cerrado"}
                      </td>
                      <td className="border-r border-b border-cerulean-200 px-2 py-1">
                        {t.Cobros?.length ?? 0}
                      </td>
                      <td className="border-b border-cerulean-200 px-2 py-1">
                        <div className="flex gap-2">
                          <CallToActionButton
                            type="button"
                            handleSubmit={() => verDetalle(t.id)}
                            disabled={abriendoDetalle}
                          >
                            Ver detalle
                          </CallToActionButton>
                          <CallToActionButton
                            type="button"
                            handleSubmit={() => verInforme(t.id)}
                            disabled={generando === t.id}
                            className="whitespace-nowrap"
                          >
                            {generando === t.id ? "Generando..." : "Ver informe"}
                          </CallToActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-center mt-2">
            <CallToActionButton type="button" handleSubmit={cerrar}>
              Cerrar
            </CallToActionButton>
          </div>
        </div>
      </Modal>

      <TurnoCajaDetalleModal
        open={detalle !== null}
        onClose={() => setDetalle(null)}
        detalle={detalle}
        onRefrescar={() => detalle && verDetalle(detalle.turno.id)}
      />
    </>
  );
}
