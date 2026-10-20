import api from "../../../services/api";
import type { Tarifa } from "../../../types/Tarifa";
import type { CobrosDelTurno } from "../../../types/Cobro";

export type NuevoCobro = {
  id_acarreo: string;
  efectivo: number;
  mp: number;
  numero_factura: string | null;
};

/** Vista previa del cobro que calcula el servidor (tarifa vigente + estadías). */
export type PreviewCobro = {
  id_acarreo: string;
  fecha_acarreo: string;
  estadias: number;
  max_estadias: number;
  horas_por_estadia: number;
  tope_estadias: boolean;
  tarifa: Tarifa | null;
  total: number | null;
};

/** Total a abonar de un acarreo (tarifa vigente + estadías por reloj). */
export const obtenerPreviewCobro = async (
  token: string,
  id_acarreo: string,
) => {
  const res = await api.get(`/cobros/preview/${id_acarreo}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Registra el cobro de un acarreo ingresado. El servidor valida el turno de
 * caja abierto del cajero, que el vehículo esté en la playa (INGRESADO),
 * calcula el total con la tarifa vigente y las estadías por reloj, y exige que
 * los medios de pago sumen ese total.
 */
export const crearCobro = async (token: string, cobro: NuevoCobro) => {
  const res = await api.post("/cobros", cobro, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Cobros del turno de caja abierto del cajero (con el acarreo, el vehículo y
 * los totales del turno). Si no hay turno abierto devuelve la lista vacía.
 */
export const obtenerCobrosDeMiTurno = async (token: string) => {
  const res = await api.get("/cobros/mi-turno", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as { success: boolean; data: CobrosDelTurno; message: string };
};

/**
 * Abre el comprobante PDF de un cobro en una pestaña nueva (para imprimir).
 *
 * El PDF lo genera el servidor y requiere el token, así que no se puede usar un
 * `window.open` directo a la URL: se pide como blob y se abre el blob. El
 * `window.open` se hace antes del `await` para no perder el "gesto del usuario"
 * (si no, el navegador bloquea la pestaña emergente).
 */
export const abrirComprobanteCobro = async (token: string, id_cobro: string) => {
  const pestania = window.open("", "_blank");

  try {
    const res = await api.get(`/cobros/${id_cobro}/comprobante.pdf`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });

    const blobUrl = window.URL.createObjectURL(res.data as Blob);

    if (pestania) {
      pestania.location.href = blobUrl;
    } else {
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    }

    // Se libera el blob cuando el navegador ya lo cargó.
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
  } catch (err) {
    pestania?.close();
    throw err;
  }
};
