import api from "../../../services/api";
import { mostrarPdf } from "../../../app/utils/informesPdf";
import type {
  TurnoBarreraDetalle,
  TurnoBarreraListado,
} from "../../../types/TurnoBarrera";

/** Todos los turnos de barrera (historial, con barrera y playeros). */
export const obtenerTurnosBarrera = async (token: string) => {
  const res = await api.get("/barreras/turnos", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as {
    success: boolean;
    data: TurnoBarreraListado[];
    message: string;
  };
};

/** Turnos de barrera en los que estuvo asignado un playero. */
export const obtenerTurnosBarreraDeUsuario = async (
  token: string,
  idUsuario: string,
) => {
  const res = await api.get(`/barreras/turnos/usuario/${idUsuario}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as {
    success: boolean;
    data: TurnoBarreraListado[];
    message: string;
  };
};

/** Detalle de un turno de barrera con los acarreos ingresados a la playa. */
export const obtenerDetalleTurnoBarrera = async (token: string, id: string) => {
  const res = await api.get(`/barreras/turnos/${id}/detalle`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as {
    success: boolean;
    data: TurnoBarreraDetalle;
    message: string;
  };
};

/** Historial de turnos (abiertos y cerrados) de una barrera. */
export const obtenerTurnosBarreraDeBarrera = async (
  token: string,
  idBarrera: string,
) => {
  const res = await api.get(`/barreras/turnos/barrera/${idBarrera}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as {
    success: boolean;
    data: TurnoBarreraListado[];
    message: string;
  };
};

/**
 * Abre el **informe del turno de barrera** en PDF, en una pestaña nueva (para
 * imprimir). Es el informe que el supervisor emite al cerrar el turno de
 * barrera (RF15 / CU13).
 *
 * El PDF lo genera el servidor y requiere el token, así que no se puede usar un
 * `window.open` directo a la URL: se pide como blob y se abre el blob. El
 * `window.open` se hace antes del `await` para no perder el "gesto del usuario"
 * (si no, el navegador bloquea la pestaña emergente).
 */
export const abrirInformeTurnoBarrera = async (
  token: string,
  id_turno_barrera: string,
  pestaniaAbierta?: Window | null,
  nombreArchivo = `informe-turno-barrera-${id_turno_barrera}.pdf`,
) => {
  const pestania = pestaniaAbierta ?? window.open("", "_blank");

  try {
    const res = await api.get(`/barreras/turnos/${id_turno_barrera}/informe.pdf`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });

    const blobUrl = window.URL.createObjectURL(res.data as Blob);

    mostrarPdf(blobUrl, pestania, nombreArchivo);

    // Se libera el blob cuando el navegador ya lo cargó.
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
  } catch (err) {
    pestania?.close();
    throw err;
  }
};
