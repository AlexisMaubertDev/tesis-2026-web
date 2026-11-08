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

// Fase 3 (RF32): toda escritura hecha EN LÍNEA también informa `fecha` con el
// reloj local del equipo, igual que la outbox lo hace al encolar. Así el
// servidor registra la hora de la operación con el mismo contrato en los dos
// modos (el server la lee con `resolverFechaOperacion`, Fase 2). No se toca el
// body si ya trae `fecha` (reintentos de la outbox) ni lo que no es un objeto
// plano (FormData, arrays, cadenas).
api.interceptors.request.use((config) => {
  const metodo = (config.method ?? "").toLowerCase();
  if (metodo === "get" || metodo === "head") return config;

  const datos: unknown = config.data;
  if (
    datos &&
    typeof datos === "object" &&
    !Array.isArray(datos) &&
    !(datos instanceof FormData) &&
    !("fecha" in datos)
  ) {
    config.data = { ...datos, fecha: new Date().toISOString() };
  }
  return config;
});

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
