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
      const { usuario, token } = action.payload;

      // El turno de caja abierto viaja en el login como `turno_caja_activo`
      // (así el cajero puede cobrar y cerrarlo aunque haya vuelto a entrar).
      // Se espeja en `Turno_Caja`, que es lo que usa el resto de la app.
      if (usuario?.turno_caja_activo && !usuario.Turno_Caja) {
        usuario.Turno_Caja = usuario.turno_caja_activo;
      }

      state.usuario = usuario;
      state.token = token;
    },
    logout: (state) => {
      state.usuario = null;
      state.token = null;
    },
    empezarTurnoCaja: (state, action: PayloadAction<Turno_Caja>) => {
      if (state.usuario) {
        state.usuario.Turno_Caja = action.payload;
        state.usuario.turno_caja_activo = action.payload;
      }
    },
    terminarTurnoCaja: (state) => {
      if (state.usuario) {
        state.usuario.Turno_Caja = null;
        state.usuario.turno_caja_activo = null;
      }
    },
  },
});

export const { loginSuccess, logout, empezarTurnoCaja, terminarTurnoCaja } =
  authSlice.actions;
export default authSlice.reducer;
