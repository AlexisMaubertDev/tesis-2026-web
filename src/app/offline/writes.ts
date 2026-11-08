import type { AxiosResponse } from "axios";
import { store } from "../store";
import { showInfo } from "../store/snackbarSlice";
import { encolarOperacion } from "./outbox";

/**
 * Escrituras con soporte offline (Fase 4, RF32).
 *
 * Los servicios de escritura del playero/cajero (acarreos, cobros, turnos de
 * caja) usan `escribir`: si la API está caída (o no hay red) la operación se
 * encola en la outbox y el flujo sigue; los reintentos y las dependencias los
 * resuelve el sincronizador. Si el usuario está en modo lectura (sesión
 * vencida) o sin sesión, la escritura se rechaza con un mensaje claro.
 */

export type EscrituraEncolada = {
  pendiente: true;
  /** Id del item de la outbox (también su Idempotency-Key). */
  id: string;
  /** Fecha/hora local de la operación (la que la outbox guardó en el body). */
  fecha: string;
};

export type RespuestaEscritura<T> = T | EscrituraEncolada;

// Guarda de tipos: viene de la cola (respuesta parcial, sin datos del
// servidor) cuando `pendiente === true`.
export const estaEncolada = <T>(
  respuesta: RespuestaEscritura<T>,
): respuesta is EscrituraEncolada =>
  Boolean(respuesta && typeof respuesta === "object" && "pendiente" in respuesta);

export type OperacionConEstado = {
  tipo: Parameters<typeof encolarOperacion>[0]["tipo"];
  metodo: Parameters<typeof encolarOperacion>[0]["metodo"];
  /** Ruta relativa a la API; puede incluir `:acarreoId` o `:turnoId`. */
  ruta: string;
  body?: unknown;
  /** Id local pregenerado (útil cuando el flujo lo necesita antes de enviarlo). */
  id?: string;
  recurso?: Parameters<typeof encolarOperacion>[0]["recurso"];
  dependeDe?: string | null;
};

/**
 * Ejecuta una escritura por API, o la encola si la API está caída / sin red.
 *
 * `apiCall` es la llamada online de siempre (ya con su body, headers y ruta
 * reales). Si se encoló, se devuelve `{ pendiente: true, id, fecha }`; las
 * pantallas que consumen `data` del servidor simplemente no la encuentran y
 * siguen con lo local.
 */
export const escribir = async <T>(
  op: OperacionConEstado,
  apiCall: () => Promise<AxiosResponse<T>>,
): Promise<RespuestaEscritura<T>> => {
  const { auth, offline } = store.getState();

  if (!auth.usuario || !auth.token) {
    throw new Error("No hay una sesión iniciada.");
  }

  // Modo lectura (sesión vencida): no se encola ni se envía.
  if (auth.sessionExpired) {
    throw new Error(
      "Tu sesión venció. Volvé a iniciar sesión para volver a operar.",
    );
  }

  const apiCaida = !offline.browserOnline || offline.apiStatus === "down";

  if (apiCaida) {
    const item = await encolarOperacion({
      ...op,
      usuarioId: auth.usuario.id,
    });

    store.dispatch(
      showInfo(
        "Sin conexión: la operación quedó guardada y se enviará cuando vuelva la API.",
      ),
    );

    return { pendiente: true, id: item.id, fecha: item.creadoEn };
  }

  const res = await apiCall();
  return res.data;
};
