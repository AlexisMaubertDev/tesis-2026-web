import axios from "axios";
import { store } from "../app/store";
import { logout } from "../app/store/authSlice";
import { showInfo } from "../app/store/snackbarSlice";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:1337/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// Rutas donde un 401 NO significa "sesión vencida" (contraseña incorrecta en el
// login). En el resto, el 401 (token ausente, inválido, vencido o de un usuario
// eliminado) se resuelve cerrando la sesión en el cliente: si no, el usuario
// queda "logueado" con un token muerto y cualquier acción falla.
const RUTAS_SIN_SESION = ["/auth/login"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? "";

    if (status === 401 && !RUTAS_SIN_SESION.some((ruta) => url.includes(ruta))) {
      store.dispatch(logout());
      // Se usa `showInfo` para no pisar el mensaje de error de la pantalla que
      // hizo la petición (se muestra junto a él, no en su lugar).
      store.dispatch(showInfo("Tu sesión venció. Volvé a iniciar sesión."));
    }

    return Promise.reject(error);
  },
);

export default api;
