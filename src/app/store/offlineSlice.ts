import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/** Estado de la API visto desde el cliente (no confundir con `navigator.onLine`). */
export type ApiStatus = "unknown" | "online" | "down";

export interface OfflineState {
  /** El navegador/el dispositivo tiene red. */
  browserOnline: boolean;
  /** La API respondió el health check (o se marcó caída por un error). */
  apiStatus: ApiStatus;
  verificando: boolean;
  latenciaMs: number | null;
  ultimoChequeo: string | null;
  sincronizando: boolean;
  /** Operaciones pendientes (sin contar las que están en conflicto). */
  pendientes: number;
  conflictos: number;
  ultimaSync: string | null;
  errorSync: string | null;
}

const initialState: OfflineState = {
  browserOnline:
    typeof navigator === "undefined" ? true : navigator.onLine !== false,
  apiStatus: "unknown",
  verificando: false,
  latenciaMs: null,
  ultimoChequeo: null,
  sincronizando: false,
  pendientes: 0,
  conflictos: 0,
  ultimaSync: null,
  errorSync: null,
};

const offlineSlice = createSlice({
  name: "offline",
  initialState,
  reducers: {
    setBrowserOnline: (state, action: PayloadAction<boolean>) => {
      state.browserOnline = action.payload;
    },
    setApiStatus: (
      state,
      action: PayloadAction<{ status: ApiStatus; latenciaMs?: number | null }>,
    ) => {
      state.apiStatus = action.payload.status;
      state.latenciaMs = action.payload.latenciaMs ?? null;
      state.ultimoChequeo = new Date().toISOString();
      state.verificando = false;
    },
    setVerificando: (state, action: PayloadAction<boolean>) => {
      state.verificando = action.payload;
    },
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.sincronizando = action.payload;
    },
    setOutboxCounts: (
      state,
      action: PayloadAction<{ pendientes: number; conflictos: number }>,
    ) => {
      state.pendientes = action.payload.pendientes;
      state.conflictos = action.payload.conflictos;
    },
    setUltimaSync: (state, action: PayloadAction<string>) => {
      state.ultimaSync = action.payload;
    },
    setErrorSync: (state, action: PayloadAction<string | null>) => {
      state.errorSync = action.payload;
    },
  },
});

export const {
  setBrowserOnline,
  setApiStatus,
  setVerificando,
  setSyncing,
  setOutboxCounts,
  setUltimaSync,
  setErrorSync,
} = offlineSlice.actions;

export default offlineSlice.reducer;
