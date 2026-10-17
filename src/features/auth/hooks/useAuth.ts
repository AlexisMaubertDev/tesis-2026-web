import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "../../../app/store/authSlice";
import type { ServerResponse } from "../../../types/ServerResponse";
import type { AuthState } from "../../../types/AuthState";

export const useAuth = () => {
  const dispatch = useDispatch();

  const login = (response: ServerResponse<AuthState>) => {
    if (!response.success || !response.data) {
      console.error(response.message || "Login failed");
      return;
    }
    // Defensa: el hash nunca debe llegar al store (se persiste en localStorage),
    // aunque la API lo devolviera por error.
    const usuario = response.data.usuario
      ? ({ ...response.data.usuario } as AuthState["usuario"] & {
          password?: string;
        })
      : null;
    if (usuario) delete usuario.password;

    dispatch(loginSuccess({ ...response.data, usuario }));
  };

  const signOut = () => {
    dispatch(logout());
  };

  return { login, signOut };
};
