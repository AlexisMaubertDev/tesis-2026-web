import axios from "axios";
import type { ClasificacionError } from "./types";

/**
 * Error de lectura cuando no hay red (o la API está caída) y el dato pedido no
 * está guardado en el dispositivo. Las pantallas lo muestran como un aviso,
 * no como un fallo del servidor.
 */
export class OfflineError extends Error {
  readonly code = "OFFLINE_SIN_CACHE";

  constructor(
    message = "No hay conexión y este dato no está guardado en el dispositivo.",
  ) {
    super(message);
    this.name = "OfflineError";
  }
}

/** Traduce un error de Axios a la clasificación que usa la outbox. */
export const clasificarError = (error: unknown): ClasificacionError => {
  if (axios.isAxiosError(error)) {
    if (
      !error.response ||
      error.code === "ECONNABORTED" ||
      error.code === "ERR_NETWORK" ||
      error.code === "ETIMEDOUT"
    ) {
      return "network";
    }

    const status = error.response.status;

    if (status === 401) return "auth";
    if (status === 429) return "rate-limit";
    if (status === 403 || status === 404 || status === 409 || status === 422) {
      return "conflict";
    }
    if (status >= 500) return "server";
    return "unknown";
  }

  return "unknown";
};

export const esErrorDeRedOServidor = (error: unknown): boolean => {
  const clasificacion = clasificarError(error);
  return clasificacion === "network" || clasificacion === "server";
};

/** Mensaje legible para mostrar en la UI o guardar en `ultimoError`. */
export const mensajeDeError = (error: unknown): string => {
  if (error instanceof OfflineError) return error.message;

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; code?: string }
      | undefined;

    if (data?.message) return data.message;

    const clasificacion = clasificarError(error);
    if (clasificacion === "network") {
      return "No hay conexión con el servidor.";
    }
    if (clasificacion === "server") {
      return "El servidor no está disponible en este momento.";
    }
    if (clasificacion === "rate-limit") {
      return "Hay demasiadas operaciones seguidas. Se reintentará en unos segundos.";
    }
  }

  if (error instanceof Error) return error.message;

  return "Ocurrió un error inesperado.";
};
