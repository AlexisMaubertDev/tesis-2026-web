import api from "../../../services/api";
import { store } from "../../../app/store";
import { obtenerConCache } from "../../../app/offline/cache";
import { leerCache } from "../../../app/offline/db";
import { clasificarError } from "../../../app/offline/errors";
import { escribir } from "../../../app/offline/writes";
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
  opciones?: { fecha_acarreo?: string | null },
): Promise<{ success: boolean; data: PreviewCobro | null; message: string }> => {
  const conRed = () => {
    const { offline, auth } = store.getState();
    return (
      offline.browserOnline &&
      offline.apiStatus !== "down" &&
      !auth.sessionExpired
    );
  };

  if (conRed()) {
    try {
      const res = await api.get(`/cobros/preview/${id_acarreo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      // La API puede caerse justo ahora: si es red/5xx se usa el cálculo local;
      // un error de negocio (404, 409...) se propaga como siempre.
      const c = clasificarError(error);
      if (c !== "network" && c !== "server") throw error;
    }
  }

  // Modo offline (Fase 5): el total se calcula en el dispositivo con la tarifa
  // vigente guardada en caché y la fecha del acarreo. Si el server no coincide
  // al sincronizar el cobro, queda en revisión (CONFLICTO).
  const datos = await calcularPreviewLocal(id_acarreo, opciones?.fecha_acarreo);
  return {
    success: true,
    data: datos,
    message: "Total calculado con la tarifa guardada en el dispositivo",
  };
};

// Criterio idéntico al del servidor (src/utils/estadias.js): bloques de 12
// horas desde el acarreo, tope de 70. Así el cajero edita el mismo importe que
// después va a calcular (o discrepar) el server.
const HORAS_POR_ESTADIA = 12;
const MAX_ESTADIAS = 70;

const calcularEstadiasLocales = (
  fechaAcarreo: string,
  hasta: Date = new Date(),
): number => {
  const inicio = new Date(fechaAcarreo).getTime();
  if (!Number.isFinite(inicio)) return 0;

  const horas = (hasta.getTime() - inicio) / 3600000;
  if (horas <= 0) return 0;

  return Math.min(MAX_ESTADIAS, Math.floor(horas / HORAS_POR_ESTADIA));
};

const redondearImporte = (valor: number) =>
  Math.round(Number(valor) * 100) / 100;

/**
 * Preview del cobro sin conexión: tarifa vigente de la caché
 * (`tarifas:vigente`, la guarda la pantalla de cajero al abrirse con red) y
 * estadías por reloj hasta «ahora» del dispositivo. Lanza `Error` con mensaje
 * claro si falta la tarifa guardada o la fecha del acarreo.
 */
const calcularPreviewLocal = async (
  id_acarreo: string,
  fecha_acarreo?: string | null,
): Promise<PreviewCobro> => {
  const usuario = store.getState().auth.usuario;

  if (!fecha_acarreo) {
    throw new Error(
      "Sin conexión no se puede calcular el total: falta la fecha del acarreo.",
    );
  }

  if (!usuario || !usuario.id) {
    throw new Error(
      "Sin conexión y sin sesión no se puede calcular el total.",
    );
  }

  const guardado = await leerCache(usuario.id, "tarifas:vigente");
  const tarifa =
    (guardado?.data as { data?: Tarifa | null } | undefined)?.data ?? null;

  if (!tarifa) {
    throw new Error(
      "Sin conexión y no hay tarifa vigente guardada en este dispositivo. Conectate una vez con la API para que se guarde.",
    );
  }

  const estadias = calcularEstadiasLocales(fecha_acarreo);
  const total = redondearImporte(
    Number(tarifa.acarreo) + Number(tarifa.estadia) * estadias,
  );

  return {
    id_acarreo,
    fecha_acarreo,
    estadias,
    max_estadias: MAX_ESTADIAS,
    horas_por_estadia: HORAS_POR_ESTADIA,
    tope_estadias: estadias >= MAX_ESTADIAS,
    tarifa,
    total,
  };
};

/**
 * Registra el cobro de un acarreo ingresado. El servidor valida el turno de
 * caja abierto del cajero, que el vehículo esté en la playa (INGRESADO),
 * calcula el total con la tarifa vigente y las estadías por reloj, y exige que
 * los medios de pago sumen ese total.
 *
 * Modo offline (Fase 4): el cobro va a la outbox (el turno de caja abierto lo
 * busca el servidor por usuario al sincronizar). Si los importes no coinciden
 * con el recálculo del server, queda en CONFLICTO para revisión.
 */
export const crearCobro = async (
  token: string,
  cobro: NuevoCobro,
  opciones?: { patente?: string | null },
) => {
  return escribir(
    {
      tipo: "COBRO",
      metodo: "POST",
      ruta: "/cobros",
      body: cobro,
      recurso: {
        tipo: "ACARREO",
        patente: opciones?.patente ?? "",
        estadoRequerido: "INGRESADO",
        id: cobro.id_acarreo ?? null,
      },
    },
    () =>
      api.post("/cobros", cobro, {
        headers: { Authorization: `Bearer ${token}` },
      }),
  );
};

/**
 * Cobros del turno de caja abierto del cajero (con el acarreo, el vehículo y
 * los totales del turno). Si no hay turno abierto devuelve la lista vacía.
 */
export const obtenerCobrosDeMiTurno = async (token: string) => {
  return obtenerConCache({
    key: "cobros:mi-turno",
    fetcher: async () => {
      const res = await api.get("/cobros/mi-turno", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data as {
        success: boolean;
        data: CobrosDelTurno;
        message: string;
      };
    },
  });
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
