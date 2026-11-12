import { store } from "./index";
import { logout } from "./authSlice";
import { showTopInfo } from "./snackbarSlice";

/**
 * Cierre de sesión por token vencido/inválido: logout directo (el usuario
 * queda sin sesión y no puede operar) + aviso informativo desde arriba.
 * La outbox y el cache viven en IndexedDB, así que no se pierde nada.
 */
export const cerrarSesionPorToken = (mensaje: string) => {
  store.dispatch(logout());
  store.dispatch(showTopInfo(mensaje));
};

/**
 * El sistema volvió y el usuario estaba operando como invitado: se lo manda
 * al login para que ingrese sus credenciales y la cola a su nombre sincronice.
 * Se limpia la pseudo-sesión (sin tocar la outbox) y se redirige con refresco
 * de ruta (la cola está en IndexedDB, no depende del store).
 */
export const volverDelModoSistema = () => {
  store.dispatch(logout());
  store.dispatch(
    showTopInfo(
      "El sistema volvió: ingresá tus credenciales para sincronizar los datos guardados.",
    ),
  );
  window.location.assign("/login");
};
