import api from "../../../services/api";

export const loginRequest = async (credentials: {
  dni: number;
  password: string;
}) => {
  const res = await api.post("/auth/login", credentials);
  return res.data;
};
