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
    dispatch(loginSuccess(response.data));
  };

  const signOut = () => {
    dispatch(logout());
  };

  return { login, signOut };
};
