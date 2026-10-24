import api from "../../../services/api";
import type { Usuario } from "../../../types/Usuario";

export const obtenerUsuarios = async (token: string) => {
  const res = await api.get("/usuarios", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const obtenerGrueros = async (token: string) => {
  const res = await api.get("/usuarios/grueros", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const obtenerPlayeros = async (token: string) => {
  const res = await api.get("/usuarios/playeros", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const crearUsuario = async (token: string, usuarioData: Usuario) => {
  const res = await api.post("/usuarios", usuarioData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const eliminarUsuario = async (token: string, legajo: string) => {
  const res = await api.delete(`/usuarios/${legajo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const editarUsuario = async (
  token: string,
  legajo: string,
  usuario: Partial<Omit<Usuario, "id">> & { password?: string },
) => {
  const res = await api.put(`/usuarios/${legajo}`, usuario, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const bloquearUsuario = async (
  token: string,
  legajo: string,
  bloqueado: boolean,
) => {
  const res = await api.put(
    `/usuarios/${legajo}/bloquear`,
    { bloqueado },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
};

export const obtenerTurnoCajasUsuario = async (token: string) => {
  const res = await api.get("/turno_caja/usuario/abiertas", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const empezarTurno_Caja = async (
  token: string,
  data: { id_caja: string; turno: string },
) => {
  const res = await api.post(`/turno_caja/empezar_turno`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const cerrarTurno_Caja = async (
  token: string,
  id_caja: string,
  arqueo?: { numero_sobre?: string | null; efectivo_contado?: number | null },
) => {
  const res = await api.put(
    `/turno_caja/cerrar_turno/${id_caja}`,
    {
      numero_sobre: arqueo?.numero_sobre ?? null,
      efectivo_contado: arqueo?.efectivo_contado ?? null,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
};

/**
 * Abre el **informe de cobros del turno** en PDF, en una pestaña nueva (para
 * imprimir). Es el informe que el cajero emite al cerrar el turno.
 *
 * El PDF lo genera el servidor y requiere el token, así que no se puede usar un
 * `window.open` directo a la URL: se pide como blob y se abre el blob. El
 * `window.open` se hace antes del `await` para no perder el "gesto del usuario"
 * (si no, el navegador bloquea la pestaña emergente).
 */
export const abrirInformeTurnoCaja = async (
  token: string,
  id_turno_caja: string,
  pestaniaAbierta?: Window | null,
) => {
  const pestania = pestaniaAbierta ?? window.open("", "_blank");

  try {
    const res = await api.get(`/turno_caja/${id_turno_caja}/informe.pdf`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });

    const blobUrl = window.URL.createObjectURL(res.data as Blob);

    if (pestania) {
      pestania.location.href = blobUrl;
    } else {
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    }

    // Se libera el blob cuando el navegador ya lo cargó.
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
  } catch (err) {
    pestania?.close();
    throw err;
  }
};
