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

export const cerrarTurno_Caja = async (token: string, id_caja: string) => {
  console.log(token);
  const res = await api.put(
    `/turno_caja/cerrar_turno/${id_caja}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
};
