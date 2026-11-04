import { useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * Avisos del service worker:
 * - `offlineReady`: la primera visita terminó de cachear el shell.
 * - `needRefresh`: hay una versión nueva esperando; se aplica recién cuando el
 *   usuario acepta, para no recargar en medio de una operación.
 */
export default function PwaUpdatePrompt() {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      registrationRef.current = registration ?? null;
    },
  });

  // En una SPA la página puede quedar abierta todo el día: al volver a la
  // pestaña se busca una versión nueva del service worker.
  useEffect(() => {
    const buscarActualizacion = () => {
      if (document.visibilityState === "visible") {
        void registrationRef.current?.update();
      }
    };

    document.addEventListener("visibilitychange", buscarActualizacion);
    return () =>
      document.removeEventListener("visibilitychange", buscarActualizacion);
  }, []);

  useEffect(() => {
    if (!offlineReady) return;

    const timeout = window.setTimeout(() => setOfflineReady(false), 6000);
    return () => window.clearTimeout(timeout);
  }, [offlineReady, setOfflineReady]);

  if (!offlineReady && !needRefresh) return null;

  return (
    <aside
      className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl flex-col gap-3
        rounded-xl bg-cerulean-900 p-4 text-white shadow-2xl sm:flex-row sm:items-center sm:justify-between"
      role="status"
      aria-live="polite"
    >
      <div>
        <p className="font-semibold">
          {needRefresh
            ? "Hay una nueva versión disponible"
            : "La app quedó lista para usarse sin conexión"}
        </p>
        <p className="text-xs text-cerulean-100">
          {needRefresh
            ? "Guardá lo que estés haciendo y actualizá para tener las últimas mejoras."
            : "El shell de ParkControl ya está guardado en este dispositivo."}
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        {needRefresh && (
          <button
            type="button"
            onClick={() => void updateServiceWorker(true)}
            className="cursor-pointer rounded-lg bg-white px-3 py-2 text-xs font-semibold text-cerulean-900
              transition-colors hover:bg-cerulean-100"
          >
            Actualizar
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setNeedRefresh(false);
            setOfflineReady(false);
          }}
          className="cursor-pointer rounded-lg border border-cerulean-400 px-3 py-2 text-xs font-semibold
            text-white transition-colors hover:bg-cerulean-800"
        >
          {needRefresh ? "Después" : "Cerrar"}
        </button>
      </div>
    </aside>
  );
}
