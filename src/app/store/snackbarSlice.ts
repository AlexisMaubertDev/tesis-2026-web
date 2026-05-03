import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: { error: string; info: string; success: string } = {
  error: "",
  info: "",
  success: "",
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
    showSuccess: (state, action: PayloadAction<string>) => {
      state.success = action.payload;
    },
    clearSnackbar: (state) => {
      state.error = "";
      state.info = "";
      state.success = "";
    },
  },
});

export const { showError, showInfo, showSuccess, clearSnackbar } =
  snackbarSlice.actions;
export default snackbarSlice.reducer;
