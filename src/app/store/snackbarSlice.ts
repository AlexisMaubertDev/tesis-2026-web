import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: {
  error: string;
  info: string;
  success: string;
  /** Aviso informativo desde arriba: vencimiento de token, sistema de vuelta. */
  topInfo: string;
} = {
  error: "",
  info: "",
  success: "",
  topInfo: "",
};

const snackbarSlice = createSlice({
  name: "snackbar",
  initialState,
  reducers: {
    showError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    showInfo: (state, action: PayloadAction<string>) => {
      state.info = action.payload;
    },
    showTopInfo: (state, action: PayloadAction<string>) => {
      state.topInfo = action.payload;
    },
    showSuccess: (state, action: PayloadAction<string>) => {
      state.success = action.payload;
    },
    clearSnackbar: (state) => {
      state.error = "";
      state.info = "";
      state.success = "";
      state.topInfo = "";
    },
  },
});

export const {
  showError,
  showInfo,
  showSuccess,
  showTopInfo,
  clearSnackbar,
} = snackbarSlice.actions;
export default snackbarSlice.reducer;
