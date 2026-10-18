import api from "../../../services/api";

export type NuevaTarifa = {
  acarreo: number;
  estadia: number;
};

/** Historial completo de tarifas (la vigente primero). */
export const obtenerTarifas = async (token: string) => {
  const res = await api.get("/tarifas", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/** Tarifa vigente (o `data: null` si todavía no se configuró ninguna). */
export const obtenerTarifaVigente = async (token: string) => {
  const res = await api.get("/tarifas/vigente", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Configura una nueva tarifa (sólo Sistemas, CU20). El servidor cierra la
 * tarifa vigente y deja la nueva como vigente.
 */
export const crearTarifa = async (token: string, tarifa: NuevaTarifa) => {
  const res = await api.post("/tarifas", tarifa, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
