import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer, {
  logout,
  marcarSesionValida,
  marcarSesionVencida,
} from "./authSlice.ts";
import snackbarReducer from "./snackbarSlice.ts";
import offlineReducer from "./offlineSlice.ts";
import { isTokenExpired } from "../utils/token.ts";
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
  // `offline` es estado de ejecución (conectividad, contadores): se recalcula
  // al abrir la app y no tiene sentido persistirlo.
  blacklist: ["snackbar", "offline"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  snackbar: snackbarReducer,
  offline: offlineReducer,
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

export const persistor = persistStore(store, null, () => {
  // Una vez rehidratada la sesión: si el token guardado ya venció, no se cierra
  // la sesión. Se marca `sessionExpired` para entrar en modo lectura con la
  // caché local y pedir un re-login al operar. Así no se pierde la outbox ni
  // los datos guardados en el dispositivo.
  const { token, usuario, sessionExpired } = store.getState().auth;

  if (token && isTokenExpired(token)) {
    if (usuario) {
      store.dispatch(marcarSesionVencida());
    } else {
      store.dispatch(logout());
    }
    return;
  }

  // Si el token sigue vigente, un vencimiento marcado antes (por un 401
  // transitorio) no debe dejar la app en modo lectura para siempre.
  if (token && usuario && sessionExpired) {
    store.dispatch(marcarSesionValida());
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
