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
import type { Grua } from "../../../types/Grua";
import type { TurnoGruaDetalle, TurnoGruaListado } from "../../../types/TurnoGrua";
import {
  obtenerDetalleTurnoGrua,
  obtenerTurnosGruaDeGrua,
} from "../services/turnosGruaService";
import TurnoGruaDetalleModal from "./TurnoGruaDetalleModal";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Grúa cuyo historial de turnos se muestra. */
  grua: Grua | null;
};

/**
 * Historial de turnos (el actual y los anteriores) de una grúa, con el chofer
 * y el enganchador de cada turno y un botón para ver el detalle (ahí el
 * supervisor puede agregar/mirar las incidencias). Se puede acotar por fecha
 * (desde/hasta). Es el modal que se abre desde la tabla de grúas.
 */
export default function TurnosGruaGruaModal({ open, onClose, grua }: Props) {
  const { token } = useSelector((state: RootState) => state.auth);

  const [turnos, setTurnos] = useState<TurnoGruaListado[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<TurnoGruaDetalle | null>(null);
  const [abriendoDetalle, setAbriendoDetalle] = useState(false);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    if (!open || !token || !grua?.id) return;

    let activo = true;

    const cargar = async () => {
      setCargando(true);
      setError(null);

      try {
        const res = await obtenerTurnosGruaDeGrua(token, grua.id);
        if (!activo) return;
        setTurnos(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (!activo) return;
        setError(
          err.response?.data?.message ||
            "No se pudieron cargar los turnos de la grúa.",
        );
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [open, token, grua?.id]);

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
      const res = await obtenerDetalleTurnoGrua(token, id);
      setDetalle(res.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "No se pudo cargar el detalle del turno de grúa.",
      );
    } finally {
      setAbriendoDetalle(false);
    }
  };

  const nombre = (usuario: TurnoGruaListado["chofer"]) =>
    usuario ? `${usuario.nombre} ${usuario.apellido}` : "-";

  const turnosFiltrados = turnos.filter((t) =>
    enRangoDeFechas(t.fecha_inicio, desde, hasta),
  );

  return (
    <>
      <Modal open={open} onClose={cerrar} sx={{ padding: 4 }}>
        <div className="absolute top-1/2 left-1/2 w-4/5 md:max-w-3xl max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans flex flex-col gap-4">
          <h2 className="text-center text-xl font-bold">
            Turnos de la grúa {grua?.patente}
          </h2>

          {grua && (
            <p className="text-center text-sm font-semibold text-cerulean-900">
              Número {grua.numero} · {grua.modelo} · {grua.Sucursal?.nombre}
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
                ? "Esta grúa no tiene turnos."
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
                      Chofer
                    </th>
                    <th className="border-r px-2 py-1 border-cerulean-400">
                      Enganchador
                    </th>
                    <th className="border-r px-2 py-1 border-cerulean-400">
                      Inicio
                    </th>
                    <th className="border-r px-2 py-1 border-cerulean-400">
                      Fin
                    </th>
                    <th className="border-r px-2 py-1 border-cerulean-400">
                      Estado
                    </th>
                    <th className="border-r px-2 py-1 border-cerulean-400">
                      Acarreos
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
                        {nombre(t.chofer)}
                      </td>
                      <td className="border-r border-b border-cerulean-200 px-2 py-1">
                        {nombre(t.enganchador)}
                      </td>
                      <td className="border-r border-b border-cerulean-200 px-2 py-1">
                        {formatDateFullWithHs(t.fecha_inicio)}
                      </td>
                      <td className="border-r border-b border-cerulean-200 px-2 py-1">
                        {t.fecha_fin ? formatDateFullWithHs(t.fecha_fin) : "-"}
                      </td>
                      <td className="border-r border-b border-cerulean-200 px-2 py-1">
                        {t.activo ? "Abierto" : "Cerrado"}
                      </td>
                      <td className="border-r border-b border-cerulean-200 px-2 py-1">
                        {t.Acarreos?.length ?? 0}
                      </td>
                      <td className="border-b border-cerulean-200 px-2 py-1">
                        <CallToActionButton
                          type="button"
                          handleSubmit={() => verDetalle(t.id)}
                          disabled={abriendoDetalle}
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

          <div className="flex justify-center mt-2">
            <CallToActionButton type="button" handleSubmit={cerrar}>
              Cerrar
            </CallToActionButton>
          </div>
        </div>
      </Modal>

      <TurnoGruaDetalleModal
        open={detalle !== null}
        onClose={() => setDetalle(null)}
        detalle={detalle}
        onRefrescar={() => detalle && verDetalle(detalle.turno.id)}
      />
    </>
  );
}
