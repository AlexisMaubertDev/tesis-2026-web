import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.ts";
import snackbarReducer from "./snackbarSlice.ts";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storageModule from "redux-persist/lib/storage";

// `redux-persist/lib/storage` es CommonJS: sus tipos lo declaran como `WebStorage`,
// pero en dev Vite sirve el default como el objeto de modulo ({ __esModule, default }).
// Se usa el mismo fallback que aplica el interop de Vite para cubrir ambos casos.
const storage =
  (storageModule as unknown as { default?: typeof storageModule }).default ??
  storageModule;

const persistConfig = {
  key: "root",
  storage,
  blacklist: ["snackbar"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  snackbar: snackbarReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: true,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
