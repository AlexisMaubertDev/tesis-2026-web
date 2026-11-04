import { store } from "../store";
import {
  setApiStatus,
  setBrowserOnline,
  setVerificando,
} from "../store/offlineSlice";

/**
 * Detecta si la API está disponible. No alcanza con `navigator.onLine`: en una
 * playa puede haber red local pero el servidor estar caído (o la base caída y
 * la API devolviendo 503). Por eso se consulta `GET /api/health`, que es
 * público y barato, y además cualquier error de red/5xx de una petición marca
 * la API como caída.
 */

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:1337/api"
).replace(/\/+$/, "");
const HEALTH_URL = `${API_URL}/health`;

const HEALTH_TIMEOUT_MS = 5_000;
/** Mientras está caída se reintenta seguido para recuperar rápido. */
const PROBE_DOWN_MS = 15_000;
/** Estando online se revisa cada tanto por si se cae sin evento del navegador. */
const PROBE_ONLINE_MS = 2 * 60_000;

let iniciado = false;
let temporizador: number | null = null;
let verificacionEnVuelo: Promise<boolean> | null = null;
let ultimaVerificacion = 0;

const programarProximoChequeo = () => {
  if (temporizador !== null) window.clearTimeout(temporizador);

  const status = store.getState().offline.apiStatus;
  const espera = status === "online" ? PROBE_ONLINE_MS : PROBE_DOWN_MS;

  temporizador = window.setTimeout(() => {
    temporizador = null;

    // Con la pestaña oculta no se gasta batería/red: se reintenta cuando el
    // usuario vuelve (evento `visibilitychange`).
    if (document.visibilityState === "hidden") {
      programarProximoChequeo();
      return;
    }

    void verificarApi({ silencioso: true });
  }, espera);
};

const ejecutarVerificacion = async (
  silencioso: boolean,
): Promise<boolean> => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    store.dispatch(setBrowserOnline(false));
    store.dispatch(setApiStatus({ status: "down", latenciaMs: null }));
    programarProximoChequeo();
    return false;
  }

  if (!silencioso) store.dispatch(setVerificando(true));
  ultimaVerificacion = Date.now();

  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    HEALTH_TIMEOUT_MS,
  );
  const inicio = performance.now();

  try {
    const res = await fetch(HEALTH_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });

    const data = (await res.json().catch(() => null)) as {
      database?: string;
    } | null;

    // 200 con database "up" es el único caso sano. Un 503 (base caída) o
    // cualquier otra respuesta se trata como API no disponible.
    const disponible = res.ok && data?.database === "up";

    store.dispatch(
      setApiStatus({
        status: disponible ? "online" : "down",
        latenciaMs: disponible
          ? Math.round(performance.now() - inicio)
          : null,
      }),
    );
    programarProximoChequeo();

    return disponible;
  } catch {
    store.dispatch(setApiStatus({ status: "down", latenciaMs: null }));
    programarProximoChequeo();
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
};

/** Consulta el health check. Las llamadas simultáneas comparten la misma promesa. */
export const verificarApi = (opciones?: {
  silencioso?: boolean;
  forzar?: boolean;
}): Promise<boolean> => {
  const silencioso = opciones?.silencioso ?? false;

  if (verificacionEnVuelo && !opciones?.forzar) {
    return verificacionEnVuelo;
  }

  const promesa = ejecutarVerificacion(silencioso);
  verificacionEnVuelo = promesa;

  void promesa.finally(() => {
    if (verificacionEnVuelo === promesa) verificacionEnVuelo = null;
  });

  return promesa;
};

/** La llama `api.ts` cuando una petición falla por red o 5xx. */
export const marcarApiCaida = () => {
  if (store.getState().offline.apiStatus === "down") return;

  store.dispatch(setApiStatus({ status: "down", latenciaMs: null }));
  programarProximoChequeo();
};

/** La llama `api.ts` cuando una petición se completa bien. */
export const marcarApiOnline = () => {
  if (store.getState().offline.apiStatus === "online") return;

  store.dispatch(setApiStatus({ status: "online", latenciaMs: null }));
  programarProximoChequeo();
};

const alConectarse = () => {
  store.dispatch(setBrowserOnline(true));
  void verificarApi({ forzar: true });
};

const alDesconectarse = () => {
  store.dispatch(setBrowserOnline(false));
  store.dispatch(setApiStatus({ status: "down", latenciaMs: null }));
};

const alCambiarVisibilidad = () => {
  if (document.visibilityState !== "visible") return;

  // Al volver a la app se revisa el estado real de la API, sin esperar al
  // próximo sondeo periódico.
  if (Date.now() - ultimaVerificacion > 30_000) {
    void verificarApi({ silencioso: true });
  }
};

const alEnfocar = () => {
  if (Date.now() - ultimaVerificacion > 60_000) {
    void verificarApi({ silencioso: true });
  }
};

/**
 * Arranca la detección de conectividad. Es idempotente: la app puede montar y
 * desmontar sin duplicar listeners ni sondeos.
 */
export const iniciarConectividad = () => {
  if (iniciado) return;
  iniciado = true;

  store.dispatch(setBrowserOnline(navigator.onLine));

  window.addEventListener("online", alConectarse);
  window.addEventListener("offline", alDesconectarse);
  window.addEventListener("focus", alEnfocar);
  document.addEventListener("visibilitychange", alCambiarVisibilidad);

  // Si el navegador lo permite, evita que el sistema borre IndexedDB cuando
  // queda poco espacio (importante para la outbox de una playa).
  if (navigator.storage?.persist) {
    void navigator.storage.persist().catch(() => undefined);
  }

  void verificarApi();

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      window.removeEventListener("online", alConectarse);
      window.removeEventListener("offline", alDesconectarse);
      window.removeEventListener("focus", alEnfocar);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);

      if (temporizador !== null) window.clearTimeout(temporizador);
      temporizador = null;
      iniciado = false;
    });
  }
};
