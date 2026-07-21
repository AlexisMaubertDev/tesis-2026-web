import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState } from "../../types/AuthState";
import type { Turno_Caja } from "../../types/Usuario";

const initialState: AuthState = {
  usuario: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<AuthState>) => {
      state.usuario = action.payload.usuario;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.usuario = null;
      state.token = null;
    },
    empezarTurnoCaja: (state, action: PayloadAction<Turno_Caja>) => {
      if (state.usuario) {
        state.usuario.Turno_Caja = action.payload;
      }
    },
    terminarTurnoCaja: (state) => {
      if (state.usuario) {
        state.usuario.Turno_Caja = null;
      }
    },
  },
});

export const { loginSuccess, logout, empezarTurnoCaja, terminarTurnoCaja } =
  authSlice.actions;
export default authSlice.reducer;
