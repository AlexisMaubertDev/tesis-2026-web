import { Modal } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import type {
  TurnoBarreraDetalle,
  TurnoBarreraListado,
} from "../../../types/TurnoBarrera";
import {
  obtenerDetalleTurnoBarrera,
  obtenerTurnosBarreraDeUsuario,
} from "../services/turnosBarreraService";
import TurnoBarreraDetalleModal from "./TurnoBarreraDetalleModal";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Playero cuyos turnos de barrera se muestran. */
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    legajo: string;
  } | null;
};

/**
 * Turnos de barrera de un playero (abiertos y cerrados). Es el modal que se
 * abre desde la tabla de usuarios (Sistemas) y la de usuarios del Supervisor:
 * lista los turnos y permite ver el detalle de cada uno.
 */
export default function TurnosBarreraUsuarioModal({
  open,
  onClose,
  usuario,
}: Props) {
  const { token } = useSelector((state: RootState) => state.auth);

  const [turnos, setTurnos] = useState<TurnoBarreraListado[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<TurnoBarreraDetalle | null>(null);
  const [abriendoDetalle, setAbriendoDetalle] = useState(false);

  useEffect(() => {
    if (!open || !token || !usuario?.id) return;

    let activo = true;

    const cargar = async () => {
      setCargando(true);
      setError(null);

      try {
        const res = await obtenerTurnosBarreraDeUsuario(token, usuario.id);
        if (!activo) return;
        setTurnos(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (!activo) return;
        setError(
          err.response?.data?.message ||
            "No se pudieron cargar los turnos de barrera del usuario.",
        );
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [open, token, usuario?.id]);

  const verDetalle = async (id: string) => {
    if (!token) return;

    setAbriendoDetalle(true);

    try {
      const res = await obtenerDetalleTurnoBarrera(token, id);
      setDetalle(res.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "No se pudo cargar el detalle del turno de barrera.",
      );
    } finally {
      setAbriendoDetalle(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} sx={{ padding: 4 }}>
        <div className="absolute top-1/2 left-1/2 w-4/5 md:max-w-3xl max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans flex flex-col gap-4">
          <h2 className="text-center text-xl font-bold">Turnos de barrera</h2>

          {usuario && (
            <p className="text-center text-sm font-semibold text-cerulean-900">
              {usuario.nombre} {usuario.apellido} (Legajo {usuario.legajo})
            </p>
          )}

          {error && (
            <p className="text-xs text-scarlet-rush-700 text-center">{error}</p>
          )}

          {cargando && (
            <p className="text-xs text-cerulean-800 text-center">
              Cargando turnos...
            </p>
          )}

          {!cargando && turnos.length === 0 && (
            <p className="text-xs text-cerulean-800 text-center">
              Este usuario no tiene turnos de barrera.
            </p>
          )}

          {turnos.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full table border-collapse text-xs">
                <thead className="bg-cerulean-600 text-white text-left">
                  <tr className="border-b border-cerulean-400">
                    <th className="border-r px-2 py-1 border-cerulean-400">
                      Barrera
                    </th>
                    <th className="border-r px-2 py-1 border-cerulean-400">
                      Turno
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
                  {turnos.map((t) => (
                    <tr key={t.id}>
                      <td className="border-r border-b border-cerulean-200 px-2 py-1 font-bold">
                        {t.Barrera?.ubicacion ?? "-"}
                      </td>
                      <td className="border-r border-b border-cerulean-200 px-2 py-1">
                        {t.turno || "-"}
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
            <CallToActionButton type="button" handleSubmit={onClose}>
              Cerrar
            </CallToActionButton>
          </div>
        </div>
      </Modal>

      <TurnoBarreraDetalleModal
        open={detalle !== null}
        onClose={() => setDetalle(null)}
        detalle={detalle}
      />
    </>
  );
}
