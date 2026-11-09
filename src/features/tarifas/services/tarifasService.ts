import api from "../../../services/api";
import { exigirConexion } from "../../../app/offline/writes";
import { obtenerConCache } from "../../../app/offline/cache";

export type NuevaTarifa = {
  acarreo: number;
  estadia: number;
};

/** Historial completo de tarifas (la vigente primero). */
export const obtenerTarifas = async (token: string) => {
  return obtenerConCache({
    key: "tarifas",
    fetcher: async () => {
      const res = await api.get("/tarifas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });
};

/** Tarifa vigente (o `data: null` si todavía no se configuró ninguna). */
export const obtenerTarifaVigente = async (token: string) => {
  return obtenerConCache({
    key: "tarifas:vigente",
    fetcher: async () => {
      const res = await api.get("/tarifas/vigente", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });
};

/**
 * Configura una nueva tarifa (sólo Sistemas, CU20). El servidor cierra la
 * tarifa vigente y deja la nueva como vigente.
 */
export const crearTarifa = async (token: string, tarifa: NuevaTarifa) => {
  exigirConexion("el alta de la tarifa");
  const res = await api.post("/tarifas", tarifa, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
