import api from "../../../services/api";

export const obtenerCajas = async (token: string) => {
  const res = await api.get("/cajas", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
