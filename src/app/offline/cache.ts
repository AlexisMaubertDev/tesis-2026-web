import { store } from "../store";
import { guardarCache, leerCache } from "./db";
import { OfflineError, clasificarError } from "./errors";

/**
 * Lecturas con caché local.
 *
 * Estrategia:
 * - Sin red, con la API caída o con la sesión vencida: se responde desde
 *   IndexedDB (modo lectura). Si no hay copia, se lanza `OfflineError`.
 * - Al arrancar (`apiStatus` todavía "unknown") con copia local: se responde
 *   ya con la copia y se revalida en segundo plano, para no bloquear la
 *   pantalla esperando al servidor.
 * - Con la API online: se va a la red y se actualiza la caché; si la red o el
 *   servidor fallan, se devuelve la última copia buena.
 */

export const CACHE_REVALIDADA_EVENT = "parkcontrol:cache-revalidada";

type OpcionesCache<T> = {
  /** Clave lógica del recurso (sin el id de usuario). */
  key: string;
  fetcher: () => Promise<T>;
  /** Fuerza ir a la red aunque haya copia local (botón "Actualizar"). */
  forzarRed?: boolean;
};

const revalidarEnSegundoPlano = async <T>(
  usuarioId: string,
  key: string,
  fetcher: () => Promise<T>,
): Promise<void> => {
  try {
    const data = await fetcher();
    await guardarCache(usuarioId, key, data);

    window.dispatchEvent(
      new CustomEvent(CACHE_REVALIDADA_EVENT, { detail: { key, data } }),
    );
  } catch {
    // Si la revalidación falla se conserva la copia local. El interceptor de
    // `api` ya se encargó de marcar la API como caída si correspondía.
  }
};

export const obtenerConCache = async <T>({
  key,
  fetcher,
  forzarRed = false,
}: OpcionesCache<T>): Promise<T> => {
  const { usuario, sessionExpired } = store.getState().auth;
  const usuarioId = usuario?.id;

  // Sin sesión no hay a quién asociar la caché: se comporta como antes.
  if (!usuarioId) return fetcher();

  const copia = await leerCache<T>(usuarioId, key);
  const { browserOnline, apiStatus } = store.getState().offline;

  const sinRed = !browserOnline || apiStatus === "down" || sessionExpired;

  if (!forzarRed) {
    if (sinRed) {
      if (copia) return copia.data;

      throw new OfflineError(
        sessionExpired
          ? "Tu sesión venció y este dato no está guardado en el dispositivo. Volvé a iniciar sesión con conexión."
          : "No hay conexión y este dato no está guardado en el dispositivo.",
      );
    }

    if (apiStatus === "unknown" && copia) {
      // Render inmediato con la copia local y revalidación en segundo plano.
      void revalidarEnSegundoPlano(usuarioId, key, fetcher);
      return copia.data;
    }
  }

  try {
    const data = await fetcher();
    await guardarCache(usuarioId, key, data);
    return data;
  } catch (error) {
    const clasificacion = clasificarError(error);

    // Red, servidor caído o sesión vencida: si hay copia, la app sigue en modo
    // lectura en vez de mostrar un error.
    if (
      copia &&
      (clasificacion === "network" ||
        clasificacion === "server" ||
        clasificacion === "auth")
    ) {
      return copia.data;
    }

    throw error;
  }
};
