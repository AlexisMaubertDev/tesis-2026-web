import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "../../app/store";

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Franja de estado que se muestra debajo del header en todas las pantallas
 * autenticadas. Resume: sin red / API caída, sesión vencida, operaciones
 * pendientes y conflictos que necesitan revisión.
 */
export default function OfflineBanner() {
  const { usuario, sessionExpired } = useSelector(
    (state: RootState) => state.auth,
  );
  const {
    browserOnline,
    apiStatus,
    sincronizando,
    pendientes,
    conflictos,
    ultimaSync,
    errorSync,
  } = useSelector((state: RootState) => state.offline);

  if (!usuario) return null;

  const sinRed = !browserOnline;
  const apiCaida = browserOnline && apiStatus === "down";

  const hayAviso =
    sinRed ||
    apiCaida ||
    sessionExpired ||
    conflictos > 0 ||
    pendientes > 0 ||
    sincronizando ||
    !!errorSync;

  if (!hayAviso) return null;

  let clase = "bg-cerulean-700 text-white";
  let mensaje = "";
  let detalle: string | null = null;
  let accion: { to: string; label: string } | null = null;

  if (sessionExpired) {
    clase = "bg-scarlet-rush-700 text-white";
    mensaje =
      "Tu sesión venció. Podés consultar los datos guardados, pero para operar tenés que volver a iniciar sesión.";
    detalle =
      pendientes > 0
        ? `${pendientes} cambio(s) esperan sincronizarse cuando vuelvas a entrar.`
        : null;
    accion = { to: "/login", label: "Iniciar sesión" };
  } else if (sinRed || apiCaida) {
    clase = "bg-amber-600 text-white";
    mensaje = sinRed
      ? "Sin conexión. La app funciona con los datos guardados y enviará los cambios al reconectar."
      : "La API no responde. La app sigue en modo lectura con los datos guardados.";
    detalle =
      pendientes > 0
        ? `${pendientes} cambio(s) pendientes de sincronizar.`
        : null;
    accion = { to: "/offline", label: "Ver cola" };
  } else if (conflictos > 0) {
    clase = "bg-scarlet-rush-700 text-white";
    mensaje = `${conflictos} operación(es) necesitan revisión antes de sincronizarse.`;
    detalle = null;
    accion = { to: "/offline", label: "Revisar" };
  } else if (sincronizando) {
    clase = "bg-cerulean-600 text-white";
    mensaje =
      pendientes > 0
        ? `Sincronizando ${pendientes} cambio(s)...`
        : "Sincronizando cambios...";
    detalle = null;
    accion = null;
  } else if (pendientes > 0) {
    clase = "bg-cerulean-600 text-white";
    mensaje = `${pendientes} cambio(s) pendientes de sincronizar.`;
    detalle = ultimaSync
      ? `Última sincronización: ${hora(ultimaSync)}.`
      : null;
    accion = { to: "/offline", label: "Ver cola" };
  } else if (errorSync) {
    clase = "bg-amber-600 text-white";
    mensaje = errorSync;
    detalle = null;
    accion = { to: "/offline", label: "Ver cola" };
  }

  return (
    <div className={`w-full px-4 py-2 text-xs ${clase}`} role="status">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p>
          <span className="font-bold">{mensaje}</span>
          {detalle && <span className="ml-1 opacity-90">{detalle}</span>}
        </p>
        {accion && (
          <Link
            to={accion.to}
            className="shrink-0 underline font-bold hover:opacity-80"
          >
            {accion.label}
          </Link>
        )}
      </div>
    </div>
  );
}
