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
