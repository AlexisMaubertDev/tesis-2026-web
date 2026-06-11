import api from "../../../services/api";

export const obtenerGruas = async (token: string) => {
  const res = await api.get("/gruas", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
