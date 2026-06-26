import api from "../../../services/api";
import type { GruaForm } from "../components/GruaModal";

export const obtenerGruas = async (token: string) => {
  const res = await api.get("/gruas", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
export const crearGrua = async (token: string, data: GruaForm) => {
  const response = await api.post("/gruas", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const obtenerGruasSucursal = async (token: string, id: string) => {
  const res = await api.get(`/gruas/sucursal/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
