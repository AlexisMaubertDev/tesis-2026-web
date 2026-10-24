import api from "../../../services/api";
import { mostrarPdf } from "../../../app/utils/informesPdf";
import type { TurnoGruaDetalle, TurnoGruaListado } from "../../../types/TurnoGrua";

/** Todos los turnos de grúa (historial, con grúa y usuarios). */
export const obtenerTurnosGrua = async (token: string) => {
  const res = await api.get("/turno_grua", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as {
    success: boolean;
    data: TurnoGruaListado[];
    message: string;
  };
};

/** Turnos de grúa de un usuario (como chofer o enganchador). */
export const obtenerTurnosGruaDeUsuario = async (
  token: string,
  idUsuario: string,
) => {
  const res = await api.get(`/turno_grua/usuario/${idUsuario}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as {
    success: boolean;
    data: TurnoGruaListado[];
    message: string;
  };
};

/** Detalle de un turno de grúa con los acarreos que hizo. */
export const obtenerDetalleTurnoGrua = async (token: string, id: string) => {
  const res = await api.get(`/turno_grua/${id}/detalle`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as {
    success: boolean;
    data: TurnoGruaDetalle;
    message: string;
  };
};

/** Historial de turnos (abiertos y cerrados) de una grúa. */
export const obtenerTurnosGruaDeGrua = async (token: string, idGrua: string) => {
  const res = await api.get(`/turno_grua/grua/${idGrua}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as {
    success: boolean;
    data: TurnoGruaListado[];
    message: string;
  };
};

/**
 * Abre el **informe por grúa** (informe del turno de grúa) en PDF, en una
 * pestaña nueva (para imprimir). Es el informe que el supervisor emite al
 * cerrar el turno de la grúa (RF27 / CU13).
 *
 * El PDF lo genera el servidor y requiere el token, así que no se puede usar un
 * `window.open` directo a la URL: se pide como blob y se abre el blob. El
 * `window.open` se hace antes del `await` para no perder el "gesto del usuario"
 * (si no, el navegador bloquea la pestaña emergente).
 */
export const abrirInformeTurnoGrua = async (
  token: string,
  id_turno_grua: string,
  pestaniaAbierta?: Window | null,
  nombreArchivo = `informe-turno-grua-${id_turno_grua}.pdf`,
) => {
  const pestania = pestaniaAbierta ?? window.open("", "_blank");

  try {
    const res = await api.get(`/turno_grua/${id_turno_grua}/informe.pdf`, {
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
