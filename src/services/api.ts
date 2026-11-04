import axios from "axios";
import { store } from "../app/store";
import { marcarSesionVencida } from "../app/store/authSlice";
import { showInfo } from "../app/store/snackbarSlice";
import {
  marcarApiCaida,
  marcarApiOnline,
} from "../app/offline/connectivity";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:1337/api";

const api = axios.create({
  baseURL: BASE_URL,
  // Sin timeout, una API colgada deja la pantalla esperando para siempre. Al
  // vencer se trata como error de red: la outbox reintenta y las lecturas usan
  // la caché local.
  timeout: 15_000,
});

// Rutas donde un 401 NO significa "sesión vencida" (contraseña incorrecta en el
// login). En el resto, el 401 (token ausente, inválido, vencido o de un usuario
// eliminado) marca la sesión como vencida: se conserva `usuario` para poder
// consultar la caché en modo lectura y no se pierde la outbox.
const RUTAS_SIN_SESION = ["/auth/login"];

api.interceptors.response.use(
  (response) => {
    marcarApiOnline();
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? "";
    const esLogin = RUTAS_SIN_SESION.some((ruta) => url.includes(ruta));

    // Red caída, timeout, API caída o base de datos caída (5xx): se marca la
    // API como no disponible para que las lecturas usen la caché y la outbox
    // espere. El 429 no cuenta: la API está viva, sólo pide esperar.
    const sinRespuesta =
      !error.response ||
      error.code === "ECONNABORTED" ||
      error.code === "ERR_NETWORK" ||
      error.code === "ETIMEDOUT";

    if (sinRespuesta || (typeof status === "number" && status >= 500)) {
      marcarApiCaida();
    }

    if (status === 401 && !esLogin) {
      const yaVencida = store.getState().auth.sessionExpired;
      store.dispatch(marcarSesionVencida());

      if (!yaVencida) {
        store.dispatch(
          showInfo(
            "Tu sesión venció. Podés consultar los datos guardados; volvé a iniciar sesión para operar.",
          ),
        );
      }
    }

    return Promise.reject(error);
  },
);

export default api;
