import api from "../../../services/api";

export const loginRequest = async (credentials: {
  dni: number;
  password: string;
}) => {
  const res = await api.post("/auth/login", credentials);
  return res.data;
};

export const logoutRequest = async (token: string) => {
  const res = await api.post(
    "/auth/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data;
};
