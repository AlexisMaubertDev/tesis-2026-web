import { store } from "../store";
import {
  setErrorSync,
  setOutboxCounts,
  setSyncing,
  setUltimaSync,
} from "../store/offlineSlice";
import { iniciarConectividad, verificarApi } from "./connectivity";
import { contarOutbox, procesarOutbox, suscribirOutbox } from "./outbox";

/**
 * Orquestador de la sincronización.
 *
 * Dispara el flush de la outbox al abrir la app, al recuperar la conexión, al
 * volver del background, al recuperar el foco y mientras la app está en uso
 * (cada minuto). También actualiza los contadores que muestra el banner.
 */

let iniciado = false;
let temporizador: number | null = null;
let intervalo: number | null = null;
let desuscribirStore: (() => void) | null = null;
let desuscribirOutbox: (() => void) | null = null;
let sincronizacionEnVuelo: Promise<void> | null = null;

export const actualizarContadoresOutbox = async (): Promise<void> => {
  const { usuario } = store.getState().auth;

  if (!usuario) {
    store.dispatch(setOutboxCounts({ pendientes: 0, conflictos: 0 }));
    return;
  }

  const { pendientes, conflictos } = await contarOutbox(usuario.id);
  store.dispatch(setOutboxCounts({ pendientes, conflictos }));
};

const ejecutarSincronizacion = async (motivo: string): Promise<void> => {
  const { usuario, token, sessionExpired } = store.getState().auth;
  const { browserOnline, apiStatus } = store.getState().offline;

  if (!usuario || !token || sessionExpired || !browserOnline) {
    await actualizarContadoresOutbox();
    return;
  }

  if (apiStatus === "down") {
    // En una sincronización manual se fuerza un health check antes de rendirse.
    if (motivo === "manual") {
      const disponible = await verificarApi({ forzar: true });
      if (!disponible) {
        await actualizarContadoresOutbox();
        return;
      }
    } else {
      await actualizarContadoresOutbox();
      return;
    }
  }

  store.dispatch(setSyncing(true));
  store.dispatch(setErrorSync(null));

  try {
    const resultado = await procesarOutbox();

    if (resultado.procesadas > 0) {
      store.dispatch(setUltimaSync(new Date().toISOString()));
    }

    if (resultado.detenidoPorRed) {
      store.dispatch(
        setErrorSync(
          "La sincronización se pausó porque el servidor no responde. Se reintentará automáticamente.",
        ),
      );
    }

    if (resultado.detenidoPorSesion) {
      store.dispatch(
        setErrorSync(
          "Tu sesión venció. Volvé a iniciar sesión para sincronizar los cambios pendientes.",
        ),
      );
    }

    await actualizarContadoresOutbox();
  } catch (error) {
    console.error("Offline: no se pudo sincronizar:", error);
    store.dispatch(
      setErrorSync(
        "No se pudo sincronizar. Se reintentará automáticamente.",
      ),
    );
  } finally {
    store.dispatch(setSyncing(false));
  }
};

/**
 * Sincroniza ahora. Las llamadas simultáneas comparten la misma promesa para
 * no mandar dos veces la misma operación.
 */
export const sincronizarAhora = (motivo = "manual"): Promise<void> => {
  if (sincronizacionEnVuelo) return sincronizacionEnVuelo;

  sincronizacionEnVuelo = ejecutarSincronizacion(motivo).finally(() => {
    sincronizacionEnVuelo = null;
  });

  return sincronizacionEnVuelo;
};

const programarSincronizacion = (demoraMs: number) => {
  if (temporizador !== null) window.clearTimeout(temporizador);

  temporizador = window.setTimeout(() => {
    temporizador = null;
    void sincronizarAhora("auto");
  }, demoraMs);
};

const alVolverVisible = () => {
  if (document.visibilityState !== "visible") return;

  void verificarApi({ silencioso: true });
  programarSincronizacion(0);
};

const alRecuperarRed = () => {
  programarSincronizacion(0);
};

const alEnfocar = () => {
  programarSincronizacion(0);
};

export const iniciarSync = () => {
  if (iniciado) return;
  iniciado = true;

  iniciarConectividad();
  void actualizarContadoresOutbox();
  void sincronizarAhora("arranque");

  desuscribirOutbox = suscribirOutbox(() => {
    void actualizarContadoresOutbox();
    programarSincronizacion(300);
  });

  let anterior = {
    token: store.getState().auth.token,
    usuarioId: store.getState().auth.usuario?.id ?? null,
    apiStatus: store.getState().offline.apiStatus,
  };

  desuscribirStore = store.subscribe(() => {
    const state = store.getState();
    const actual = {
      token: state.auth.token,
      usuarioId: state.auth.usuario?.id ?? null,
      apiStatus: state.offline.apiStatus,
    };

    const cambioSesion =
      actual.token !== anterior.token ||
      actual.usuarioId !== anterior.usuarioId;

    if (cambioSesion) {
      void actualizarContadoresOutbox();
      if (actual.token) programarSincronizacion(0);
    }

    // Al recuperarse la API se reintenta la cola sin esperar al próximo sondeo.
    if (actual.apiStatus === "online" && anterior.apiStatus !== "online") {
      programarSincronizacion(0);
    }

    anterior = actual;
  });

  window.addEventListener("online", alRecuperarRed);
  window.addEventListener("focus", alEnfocar);
  document.addEventListener("visibilitychange", alVolverVisible);

  // Mientras la app está en uso, se reintenta la cola cada minuto. El flush
  // respeta los backoffs de cada operación, así que no manda de más.
  intervalo = window.setInterval(() => {
    if (document.visibilityState === "visible" && navigator.onLine) {
      void sincronizarAhora("periodico");
    }
  }, 60_000);

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      desuscribirStore?.();
      desuscribirOutbox?.();
      desuscribirStore = null;
      desuscribirOutbox = null;

      window.removeEventListener("online", alRecuperarRed);
      window.removeEventListener("focus", alEnfocar);
      document.removeEventListener("visibilitychange", alVolverVisible);

      if (temporizador !== null) window.clearTimeout(temporizador);
      if (intervalo !== null) window.clearInterval(intervalo);
      temporizador = null;
      intervalo = null;
      iniciado = false;
    });
  }
};
