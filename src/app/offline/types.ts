/**
 * Tipos del núcleo offline de la web.
 *
 * La outbox guarda una operación de escritura por cada acción que el usuario
 * hace sin conexión (o que no llegó a confirmar el servidor). Cada operación
 * viaja con una `Idempotency-Key` estable (el `id` del item), así el backend
 * puede repetir la respuesta sin duplicar acarreos, cobros ni movimientos.
 */

export type OutboxEstado = "PENDIENTE" | "ENVIANDO" | "CONFLICTO";

export type OutboxTipo =
  | "ACARREO"
  | "INGRESO"
  | "EGRESO"
  | "SIN_CARGO"
  | "INCIDENCIA_ACARREO"
  | "COBRO"
  | "TURNO_CAJA_INICIO"
  | "TURNO_CAJA_CIERRE"
  | "INCIDENCIA_TURNO_CAJA";

/**
 * Recurso del que depende la operación. Si todavía no existe (por ejemplo, el
 * acarreo de una patente que el gruero aún no sincronizó), el flush espera y
 * reintenta más tarde en lugar de fallar.
 */
export type RecursoOutbox =
  | {
      tipo: "ACARREO";
      patente: string;
      /** Estado que debe tener el acarreo para poder ejecutar la operación. */
      estadoRequerido?: string;
      /** Id ya resuelto (se completa al encontrarlo). */
      id?: string | null;
    }
  | {
      tipo: "TURNO_CAJA";
      /** Id local (el que se conoce aunque el turno se haya abierto offline). */
      id: string;
      /** Id que asignó el servidor cuando el turno se sincronizó. */
      servidorId?: string | null;
    }
  | null;

export type OutboxConflicto = {
  status: number;
  code?: string;
  message: string;
};

export type OutboxItem = {
  /** UUID generado en el dispositivo; también es la Idempotency-Key. */
  id: string;
  usuarioId: string;
  tipo: OutboxTipo;
  metodo: "POST" | "PUT" | "PATCH" | "DELETE";
  /** Ruta relativa a la base de la API (`/acarreos`, `/cobros`, ...). */
  ruta: string;
  body: unknown;
  /** Fecha/hora local de la operación (ISO con offset del dispositivo). */
  creadoEn: string;
  estado: OutboxEstado;
  intentos: number;
  proximoIntentoEn: number | null;
  ultimoError: string | null;
  respuesta: unknown;
  conflicto: OutboxConflicto | null;
  recurso: RecursoOutbox;
  /**
   * Id de otra operación de la outbox que tiene que completarse antes. Sirve
   * para ordenar, por ejemplo, el alta de un acarreo y su ingreso a playa
   * cuando ambos se hicieron sin conexión.
   */
  dependeDe: string | null;
  actualizadoEn: string;
};

export type CacheEntry<T = unknown> = {
  key: string;
  usuarioId: string;
  data: T;
  actualizadoEn: string;
};

export type ClasificacionError =
  | "network"
  | "server"
  | "auth"
  | "conflict"
  | "rate-limit"
  | "unknown";
