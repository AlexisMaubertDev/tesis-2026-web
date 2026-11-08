import api from "../../../services/api";
import { obtenerConCache } from "../../../app/offline/cache";
import { escribir } from "../../../app/offline/writes";
import type { Vehiculo } from "../../../types/Vehiculo";

export const obtenerVehiculos = async (token: string) => {
  return obtenerConCache({
    key: "vehiculos",
    fetcher: async () => {
      const res = await api.get("/vehiculos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
  });
};

export type FiltrosInformeVehiculos = {
  busqueda?: string;
  sucursales?: string[];
  estados?: string[];
  fechaDesde?: string;
  fechaHasta?: string;
};

/**
 * Abre el PDF del listado de vehículos en una pestaña nueva.
 *
 * El PDF lo genera el servidor aplicando los mismos filtros que la tabla
 * (búsqueda por patente/modelo, sucursal, estado y fecha del último acarreo).
 * Se pide como blob porque la ruta requiere el token: hacer `window.open`
 * directo perdería el encabezado de autorización.
 */
export const abrirInformeVehiculosPdf = async (
  token: string,
  filtros: FiltrosInformeVehiculos,
) => {
  const params = new URLSearchParams();
  const busqueda = filtros.busqueda?.trim();

  if (busqueda) params.set("busqueda", busqueda);
  filtros.sucursales?.forEach((sucursal) => {
    if (sucursal) params.append("sucursal", sucursal);
  });
  filtros.estados?.forEach((estado) => {
    if (estado) params.append("estado", estado);
  });
  if (filtros.fechaDesde) params.set("fecha_desde", filtros.fechaDesde);
  if (filtros.fechaHasta) params.set("fecha_hasta", filtros.fechaHasta);

  const query = params.toString();
  const pestania = window.open("", "_blank");

  try {
    const res = await api.get(
      `/vehiculos/informe.pdf${query ? `?${query}` : ""}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      },
    );

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

export const editarVehiculo = async (
  token: string,
  id: string,
  vehiculo: Partial<Omit<Vehiculo, "id">>,
) => {
  const res = await api.put(`/vehiculos/${id}`, vehiculo, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const eliminarVehiculo = async (token: string, id: string) => {
  const res = await api.delete(`/vehiculos/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const obtenerAcarreosPorPatente = async (
  token: string,
  patente: string,
) => {
  const patenteNormalizada = patente.trim().toUpperCase();

  return obtenerConCache({
    key: `acarreos:patente:${patenteNormalizada}`,
    fetcher: async () => {
      const res = await api.get(
        `/acarreos/patente/${encodeURIComponent(patenteNormalizada)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res.data;
    },
  });
};

/**
 * Ingreso a playa desde la barrera: el acarreo ACARREADO pasa a INGRESADO.
 * La usa el home del playero.
 *
 * Modo offline (Fase 4): la operación va a la outbox con el recurso por
 * patente (estado esperado ACARREADO); el `:acarreoId` se resuelve al
 * sincronizar (el id puede ser null si el acarreo aún no existe en el server).
 */
export const ingresarAcarreoAPlaya = async (
  token: string,
  acarreoId: string,
  opciones?: { patente?: string | null },
) => {
  return escribir(
    {
      tipo: "INGRESO",
      metodo: "PUT",
      ruta: "/acarreos/:acarreoId/ingresar",
      body: {},
      recurso: {
        tipo: "ACARREO",
        patente: opciones?.patente ?? "",
        estadoRequerido: "ACARREADO",
        id: acarreoId ?? null,
      },
    },
    () =>
      api.put(`/acarreos/${acarreoId}/ingresar`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      }),
  );
};

/**
 * Salida de playa desde la barrera: el acarreo COBRADO (abonado) pasa a
 * EGRESADO. La usa el home del playero.
 */
export const egresarAcarreo = async (
  token: string,
  acarreoId: string,
  opciones?: { patente?: string | null },
) => {
  return escribir(
    {
      tipo: "EGRESO",
      metodo: "PUT",
      ruta: "/acarreos/:acarreoId/egresar",
      body: {},
      recurso: {
        tipo: "ACARREO",
        patente: opciones?.patente ?? "",
        estadoRequerido: "COBRADO",
        id: acarreoId ?? null,
      },
    },
    () =>
      api.put(`/acarreos/${acarreoId}/egresar`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      }),
  );
};

/**
 * Salida sin cargo: un acarreo INGRESADO pasa a SIN_CARGO guardando el motivo.
 * Sólo el supervisor (o sistemas) puede autorizarla.
 */
export const sacarSinCargo = async (
  token: string,
  acarreoId: string,
  motivo: string,
  opciones?: { patente?: string | null },
) => {
  return escribir(
    {
      tipo: "SIN_CARGO",
      metodo: "PUT",
      ruta: "/acarreos/:acarreoId/sin-cargo",
      body: { motivo },
      recurso: {
        tipo: "ACARREO",
        patente: opciones?.patente ?? "",
        estadoRequerido: "INGRESADO",
        id: acarreoId ?? null,
      },
    },
    () =>
      api.put(`/acarreos/${acarreoId}/sin-cargo`, { motivo }, {
        headers: { Authorization: `Bearer ${token}` },
      }),
  );
};

/**
 * Agrega una incidencia al acarreo (el vehículo). Sólo el supervisor (o
 * sistemas) puede agregarla.
 */
export const agregarIncidenciaAcarreo = async (
  token: string,
  acarreoId: string,
  incidencias: string,
) => {
  const res = await api.put(
    `/acarreos/${acarreoId}/incidencias`,
    { incidencias },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
};
