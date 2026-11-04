import axios from "axios";
import api from "../../services/api";
import { store } from "../store";
import {
  empezarTurnoCaja,
  marcarSesionVencida,
  terminarTurnoCaja,
} from "../store/authSlice";
import type { Turno_Caja } from "../../types/Usuario";
import {
  borrarCachePorPrefijo,
  borrarOutbox,
  guardarCache,
  guardarOutbox,
  leerCache,
  listarOutbox,
  obtenerOutbox,
} from "./db";
import { clasificarError, mensajeDeError } from "./errors";
import { marcarApiCaida } from "./connectivity";
import type {
  OutboxConflicto,
  OutboxItem,
  OutboxTipo,
  RecursoOutbox,
} from "./types";

/**
 * Outbox de escrituras offline.
 *
 * Cada operación se guarda en IndexedDB **antes** de intentar el envío (write
 * ahead) y viaja con una `Idempotency-Key` estable (su `id`). El flush respeta:
 * - el orden de creación;
 * - `dependeDe`: no ejecuta una operación hasta que la anterior salga de la
 *   outbox (por ejemplo, el alta de un acarreo antes de su ingreso a playa);
 * - `recurso`: resuelve la patente contra `GET /acarreos/patente/:patente` y
 *   espera si el acarreo todavía no existe en el servidor;
 * - backoff exponencial para red, 5xx, 429 y `OPERACION_EN_PROCESO`;
 * - `CONFLICTO` para los 4xx terminales (estado/importe que no coincide), que
 *   quedan para revisión manual desde la pantalla de la cola.
 */

type Listener = () => void;
const listeners = new Set<Listener>();

export const suscribirOutbox = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const notificarOutbox = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.error("Offline: error en un listener de la outbox:", error);
    }
  });
};

const crearId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (caracter) => {
    const aleatorio = (Math.random() * 16) | 0;
    const valor = caracter === "x" ? aleatorio : (aleatorio & 0x3) | 0x8;
    return valor.toString(16);
  });
};

export type NuevaOperacion = {
  usuarioId: string;
  tipo: OutboxTipo;
  metodo: OutboxItem["metodo"];
  /** Ruta relativa a la API; puede incluir `:acarreoId` o `:turnoId`. */
  ruta: string;
  body?: unknown;
  /** Fecha/hora local de la operación (ISO con offset). */
  creadoEn?: string;
  recurso?: RecursoOutbox;
  dependeDe?: string | null;
};

/**
 * Agrega la fecha local al body. El servidor todavía usa su propio reloj en
 * algunas rutas, pero la Fase 2 va a leer `fecha` del body: dejarla guardada
 * desde el momento de la operación evita que el momento de sincronización
 * distorsione acarreos, cobros e ingresos/egresos.
 */
const conFechaLocal = (body: unknown, creadoEn: string): unknown => {
  if (body === null || body === undefined) return { fecha: creadoEn };
  if (typeof body !== "object" || Array.isArray(body)) return body;

  const registro = body as Record<string, unknown>;
  if ("fecha" in registro) return body;

  return { ...registro, fecha: creadoEn };
};

/** Encola una operación para enviarla ahora o cuando vuelva la conexión. */
export const encolarOperacion = async (
  operacion: NuevaOperacion,
): Promise<OutboxItem> => {
  const ahora = new Date().toISOString();
  const creadoEn = operacion.creadoEn ?? ahora;

  const item: OutboxItem = {
    id: crearId(),
    usuarioId: operacion.usuarioId,
    tipo: operacion.tipo,
    metodo: operacion.metodo,
    ruta: operacion.ruta,
    body: conFechaLocal(operacion.body, creadoEn),
    creadoEn,
    estado: "PENDIENTE",
    intentos: 0,
    proximoIntentoEn: null,
    ultimoError: null,
    respuesta: null,
    conflicto: null,
    recurso: operacion.recurso ?? null,
    dependeDe: operacion.dependeDe ?? null,
    actualizadoEn: ahora,
  };

  await guardarOutbox(item);
  notificarOutbox();

  return item;
};

const BACKOFF_BASE_MS = 15_000;
const BACKOFF_MAX_MS = 10 * 60_000;

const backoffMs = (intentos: number): number => {
  const exponencial = Math.min(
    BACKOFF_MAX_MS,
    BACKOFF_BASE_MS * 2 ** Math.max(0, intentos - 1),
  );
  const jitter = Math.floor(Math.random() * 2_000);
  return exponencial + jitter;
};

const retryAfterMs = (error: unknown): number | null => {
  if (!axios.isAxiosError(error)) return null;

  const header = error.response?.headers?.["retry-after"];
  if (header === undefined || header === null) return null;

  const segundos = Number(header);
  if (Number.isFinite(segundos)) return Math.max(1_000, segundos * 1_000);

  const fecha = Date.parse(String(header));
  if (!Number.isNaN(fecha)) return Math.max(1_000, fecha - Date.now());

  return null;
};

type AcarreoResumen = {
  id: string;
  estado: string;
  fecha_acarreo?: string;
};

type Resolucion =
  | { estado: "listo"; item: OutboxItem }
  | { estado: "esperando"; motivo: string }
  | { estado: "conflicto"; item: OutboxItem; conflicto: OutboxConflicto }
  | { estado: "error"; error: unknown };

const resolverRecurso = async (
  item: OutboxItem,
  token: string,
  mapaTurnos: Map<string, string>,
): Promise<Resolucion> => {
  const recurso = item.recurso;
  if (!recurso) return { estado: "listo", item };

  if (recurso.tipo === "TURNO_CAJA") {
    const localId = recurso.id;
    let servidorId =
      recurso.servidorId ?? mapaTurnos.get(localId) ?? null;

    if (!servidorId) {
      const guardado = await leerCache<string>(
        item.usuarioId,
        `sync:turno:local:${localId}`,
      );
      servidorId = guardado?.data ?? null;
    }

    if (!servidorId && item.ruta.includes(":turnoId")) {
      return {
        estado: "esperando",
        motivo: "El turno de caja todavía no se sincronizó.",
      };
    }

    const ruta = item.ruta.replace(":turnoId", servidorId ?? localId);

    return {
      estado: "listo",
      item: {
        ...item,
        ruta,
        recurso: { ...recurso, servidorId },
      },
    };
  }

  let acarreoId = recurso.id ?? null;

  if (!acarreoId) {
    const patente = recurso.patente;

    try {
      const res = await api.get(
        `/acarreos/patente/${encodeURIComponent(patente)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const acarreos = (res.data?.data ?? []) as AcarreoResumen[];

      if (acarreos.length === 0) {
        return {
          estado: "esperando",
          motivo: `El acarreo de ${patente} todavía no existe en el servidor.`,
        };
      }

      const estadoRequerido = recurso.estadoRequerido;

      if (estadoRequerido) {
        const candidato = acarreos.find(
          (acarreo) => acarreo.estado === estadoRequerido,
        );

        if (!candidato) {
          const estadoActual = acarreos[0]?.estado ?? "desconocido";
          return {
            estado: "conflicto",
            item,
            conflicto: {
              status: 409,
              code: "ESTADO_ACARREO",
              message: `El acarreo de ${patente} está en estado ${estadoActual} y la operación esperaba ${estadoRequerido}.`,
            },
          };
        }

        acarreoId = candidato.id;
      } else {
        acarreoId = acarreos[0].id;
      }
    } catch (error) {
      // Si el vehículo/acarreo todavía no existe, no es un error: se espera a
      // que el gruero sincronice el alta.
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return {
          estado: "esperando",
          motivo: `El acarreo de ${patente} todavía no existe en el servidor.`,
        };
      }

      return { estado: "error", error };
    }
  }

  const ruta = item.ruta.replace(":acarreoId", acarreoId);

  let body = item.body;
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const registro = body as Record<string, unknown>;
    if ("id_acarreo" in registro && !registro.id_acarreo) {
      body = { ...registro, id_acarreo: acarreoId };
    }
  }

  return {
    estado: "listo",
    item: {
      ...item,
      ruta,
      body,
      recurso: { ...recurso, id: acarreoId },
    },
  };
};

const invalidarLecturas = async (usuarioId: string): Promise<void> => {
  await Promise.all([
    borrarCachePorPrefijo(usuarioId, "vehiculos"),
    borrarCachePorPrefijo(usuarioId, "acarreos:"),
    borrarCachePorPrefijo(usuarioId, "cobros:"),
    borrarCachePorPrefijo(usuarioId, "turno-caja:"),
  ]);
};

const aplicarEfectos = async (
  item: OutboxItem,
  respuesta: unknown,
  mapaTurnos: Map<string, string>,
): Promise<void> => {
  const usuarioActual = store.getState().auth.usuario;
  const esElMismoUsuario = usuarioActual?.id === item.usuarioId;

  if (item.tipo === "TURNO_CAJA_INICIO") {
    const data = (
      respuesta as { data?: { id?: string } } | null | undefined
    )?.data;

    const localId =
      item.recurso?.tipo === "TURNO_CAJA" ? item.recurso.id : null;

    if (localId && data?.id) {
      mapaTurnos.set(localId, data.id);
      await guardarCache(
        item.usuarioId,
        `sync:turno:local:${localId}`,
        data.id,
      );
    }

    if (esElMismoUsuario && data) {
      store.dispatch(empezarTurnoCaja(data as Turno_Caja));
    }
  }

  if (item.tipo === "TURNO_CAJA_CIERRE" && esElMismoUsuario) {
    store.dispatch(terminarTurnoCaja());
  }

  // Cualquier escritura invalida las lecturas cacheadas relacionadas. La
  // próxima pantalla que consulte vuelve a pedir los datos frescos.
  await invalidarLecturas(item.usuarioId);
};

const devolverAPendiente = async (
  item: OutboxItem,
  error: unknown,
  esperaMs: number | null,
): Promise<void> => {
  const intentos = item.intentos + 1;

  await guardarOutbox({
    ...item,
    estado: "PENDIENTE",
    intentos,
    proximoIntentoEn: Date.now() + (esperaMs ?? backoffMs(intentos)),
    ultimoError: mensajeDeError(error),
    actualizadoEn: new Date().toISOString(),
  });
};

export type ResultadoSync = {
  procesadas: number;
  pendientes: number;
  conflictos: number;
  detenidoPorRed: boolean;
  detenidoPorSesion: boolean;
};

const contarRestantes = async (
  usuarioId: string | undefined,
): Promise<{ pendientes: number; conflictos: number }> => {
  if (!usuarioId) return { pendientes: 0, conflictos: 0 };

  const items = await listarOutbox(usuarioId);
  const conflictos = items.filter(
    (item) => item.estado === "CONFLICTO",
  ).length;

  return { pendientes: items.length - conflictos, conflictos };
};

const ejecutarProcesamiento = async (): Promise<ResultadoSync> => {
  const { usuario, token, sessionExpired } = store.getState().auth;
  const { browserOnline, apiStatus } = store.getState().offline;

  if (
    !usuario ||
    !token ||
    sessionExpired ||
    !browserOnline ||
    apiStatus === "down"
  ) {
    const restantes = await contarRestantes(usuario?.id);
    return {
      procesadas: 0,
      ...restantes,
      detenidoPorRed: !browserOnline || apiStatus === "down",
      detenidoPorSesion: sessionExpired,
    };
  }

  const items = (await listarOutbox(usuario.id)).sort(
    (a, b) =>
      a.creadoEn.localeCompare(b.creadoEn) || a.id.localeCompare(b.id),
  );

  const idsEnOutbox = new Set(items.map((item) => item.id));
  const mapaTurnos = new Map<string, string>();

  let procesadas = 0;
  let detenidoPorRed = false;
  let detenidoPorSesion = false;
  let huboCambios = false;

  for (const original of items) {
    if (original.estado === "CONFLICTO") continue;
    if (
      original.proximoIntentoEn &&
      original.proximoIntentoEn > Date.now()
    ) {
      continue;
    }
    if (original.dependeDe && idsEnOutbox.has(original.dependeDe)) {
      continue;
    }

    const resolucion = await resolverRecurso(original, token, mapaTurnos);

    if (resolucion.estado === "esperando") continue;

    if (resolucion.estado === "conflicto") {
      await guardarOutbox({
        ...resolucion.item,
        estado: "CONFLICTO",
        conflicto: resolucion.conflicto,
        ultimoError: resolucion.conflicto.message,
        actualizadoEn: new Date().toISOString(),
      });
      huboCambios = true;
      continue;
    }

    if (resolucion.estado === "error") {
      const clasificacion = clasificarError(resolucion.error);

      if (clasificacion === "auth") {
        marcarSesionVencida();
        detenidoPorSesion = true;
        break;
      }

      if (clasificacion === "network" || clasificacion === "server") {
        marcarApiCaida();
        detenidoPorRed = true;
        break;
      }

      await devolverAPendiente(original, resolucion.error, null);
      huboCambios = true;
      break;
    }

    const item: OutboxItem = {
      ...resolucion.item,
      estado: "ENVIANDO",
      actualizadoEn: new Date().toISOString(),
    };
    await guardarOutbox(item);

    try {
      const res = await api.request({
        method: item.metodo,
        url: item.ruta,
        data: item.body,
        headers: {
          Authorization: `Bearer ${token}`,
          "Idempotency-Key": item.id,
        },
      });

      await borrarOutbox(item.id);
      idsEnOutbox.delete(item.id);
      await aplicarEfectos(item, res.data, mapaTurnos);

      procesadas++;
      huboCambios = true;
    } catch (error) {
      const clasificacion = clasificarError(error);
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;
      const data = axios.isAxiosError(error)
        ? (error.response?.data as
            | { code?: string; message?: string; reintentar?: boolean }
            | undefined)
        : undefined;

      if (clasificacion === "auth") {
        marcarSesionVencida();
        await devolverAPendiente(item, error, null);
        detenidoPorSesion = true;
        huboCambios = true;
        break;
      }

      if (clasificacion === "network" || clasificacion === "server") {
        marcarApiCaida();
        await devolverAPendiente(item, error, null);
        detenidoPorRed = true;
        huboCambios = true;
        break;
      }

      // La operación está en proceso en el servidor: se reintenta más tarde
      // (el middleware devuelve `Retry-After`).
      if (
        clasificacion === "rate-limit" ||
        (status === 409 && data?.code === "OPERACION_EN_PROCESO")
      ) {
        await devolverAPendiente(item, error, retryAfterMs(error));
        huboCambios = true;
        break;
      }

      // 4xx terminal (estado/importe que no coincide, sin permiso, etc.):
      // queda en conflicto para que una persona lo revise.
      const conflicto: OutboxConflicto = {
        status: status ?? 0,
        code: data?.code,
        message: mensajeDeError(error),
      };

      await guardarOutbox({
        ...item,
        estado: "CONFLICTO",
        conflicto,
        ultimoError: conflicto.message,
        actualizadoEn: new Date().toISOString(),
      });
      huboCambios = true;
    }
  }

  if (huboCambios) notificarOutbox();

  const restantes = await contarRestantes(usuario.id);

  return {
    procesadas,
    ...restantes,
    detenidoPorRed,
    detenidoPorSesion,
  };
};

let procesando = false;
let procesamientoEnVuelo: Promise<ResultadoSync> | null = null;

/** Procesa la outbox. Las llamadas simultáneas comparten la misma promesa. */
export const procesarOutbox = (): Promise<ResultadoSync> => {
  if (procesando && procesamientoEnVuelo) return procesamientoEnVuelo;

  procesando = true;
  const promesa = ejecutarProcesamiento().finally(() => {
    procesando = false;
    procesamientoEnVuelo = null;
  });

  procesamientoEnVuelo = promesa;
  return promesa;
};

/** Devuelve una operación en conflicto a la cola de pendientes. */
export const reintentarOperacion = async (id: string): Promise<void> => {
  const item = await obtenerOutbox(id);
  if (!item) return;

  await guardarOutbox({
    ...item,
    estado: "PENDIENTE",
    intentos: 0,
    proximoIntentoEn: null,
    conflicto: null,
    ultimoError: null,
    actualizadoEn: new Date().toISOString(),
  });
  notificarOutbox();
};

/** Descarta definitivamente una operación (el usuario asume la pérdida). */
export const descartarOperacion = async (id: string): Promise<void> => {
  await borrarOutbox(id);
  notificarOutbox();
};

export const contarOutbox = async (
  usuarioId: string,
): Promise<{ pendientes: number; conflictos: number; total: number }> => {
  const items = await listarOutbox(usuarioId);
  const conflictos = items.filter(
    (item) => item.estado === "CONFLICTO",
  ).length;

  return {
    pendientes: items.length - conflictos,
    conflictos,
    total: items.length,
  };
};
