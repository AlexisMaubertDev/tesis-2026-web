import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState } from "../../types/AuthState";
import type { Turno_Caja, Usuario } from "../../types/Usuario";

const initialState: AuthState = {
  usuario: null,
  token: null,
  sessionExpired: false,
  invitadoOffline: false,
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
      state.sessionExpired = false;
      state.invitadoOffline = false;
    },
    logout: (state) => {
      state.usuario = null;
      state.token = null;
      state.sessionExpired = false;
      state.invitadoOffline = false;
    },
    /**
     * Entrada "sin sistema": el operador elige su rol y entra como invitado,
     * sin token ni credenciales. Sólo puede usar lo operativo (cobrar,
     * ingresar, dar salida) y las operaciones quedan a nombre de `invitado`
     * hasta que ingrese con sus credenciales cuando el sistema vuelva.
     */
    entrarSinSistema: (state, action: PayloadAction<Usuario["rol"]>) => {
      const rol = action.payload;
      state.usuario = {
        id: "invitado",
        nombre: "Invitado",
        apellido: rol,
        dni: "",
        rol,
      } as unknown as Usuario;
      state.token = null;
      state.sessionExpired = false;
      state.invitadoOffline = true;
    },
    /** El servidor rechazó el token: se conserva la sesión en modo lectura. */
    marcarSesionVencida: (state) => {
      if (state.usuario) state.sessionExpired = true;
    },
    marcarSesionValida: (state) => {
      state.sessionExpired = false;
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

export const {
  loginSuccess,
  logout,
  entrarSinSistema,
  marcarSesionVencida,
  marcarSesionValida,
  empezarTurnoCaja,
  terminarTurnoCaja,
} = authSlice.actions;
export default authSlice.reducer;
