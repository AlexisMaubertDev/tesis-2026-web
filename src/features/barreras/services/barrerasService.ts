import api from "../../../services/api";

export const obtenerBarreras = async (token: string) => {
  const res = await api.get("/barreras", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
