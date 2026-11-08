import api from "../../../services/api";
import { store } from "../../../app/store";
import type { Usuario, CajaDelTurno } from "../../../types/Usuario";
import type { Caja } from "../../../types/Caja";
import { escribir, estaEncolada } from "../../../app/offline/writes";
import { guardarCache, leerCache } from "../../../app/offline/db";

export const obtenerUsuarios = async (token: string) => {
  const res = await api.get("/usuarios", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const obtenerGrueros = async (token: string) => {
  const res = await api.get("/usuarios/grueros", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const obtenerPlayeros = async (token: string) => {
  const res = await api.get("/usuarios/playeros", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const crearUsuario = async (token: string, usuarioData: Usuario) => {
  const res = await api.post("/usuarios", usuarioData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const eliminarUsuario = async (token: string, legajo: string) => {
  const res = await api.delete(`/usuarios/${legajo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const editarUsuario = async (
  token: string,
  legajo: string,
  usuario: Partial<Omit<Usuario, "id">> & { password?: string },
) => {
  const res = await api.put(`/usuarios/${legajo}`, usuario, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const bloquearUsuario = async (
  token: string,
  legajo: string,
  bloqueado: boolean,
) => {
  const res = await api.put(
    `/usuarios/${legajo}/bloquear`,
    { bloqueado },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
};

export const obtenerTurnoCajasUsuario = async (token: string) => {
  const res = await api.get("/turno_caja/usuario/abiertas", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

/**
 * Empieza el turno de caja del cajero.
 *
 * Modo offline (Fase 4): la apertura va a la outbox y el turno se crea igual
 * en el cliente con un **id local** (el id del item de la outbox), así el
 * cajero puede seguir cobrando. Cuando la cola envía la apertura, el mapeo
 * local → servidor lo guarda el sincronizador (`sync:turno:local:`) y los
 * cobros/cierres encolados se resuelven con ese id.
 */
export type DatosNuevoTurnoCaja = {
  id_caja: string;
  turno: string;
  /** Datos de la caja seleccionada, para el turno local en modo offline. */
  caja?: CajaDelTurno | Caja | null;
};

/**
 * Empieza el turno de caja del cajero.
 *
 * Modo offline (Fase 4): la apertura va a la outbox y el turno se crea igual
 * en el cliente con un **id local** (el id del item de la outbox), así el
 * cajero puede seguir cobrando. Cuando la cola envía la apertura, el mapeo
 * local → servidor lo guarda el sincronizador (`sync:turno:local:`) y los
 * cierres encolados se resuelven con ese id.
 */
export const empezarTurno_Caja = async (
  token: string,
  data: DatosNuevoTurnoCaja,
) => {
  // Id local pregenerado: la apertura encolada se crea con este id y las
  // operaciones posteriores (cierre) lo referencian hasta que el server mande
  // el id real.
  const localId = crypto.randomUUID();

  const resultado = await escribir(
    {
      tipo: "TURNO_CAJA_INICIO",
      metodo: "POST",
      ruta: "/turno_caja/empezar_turno",
      body: { id_caja: data.id_caja, turno: data.turno },
      id: localId,
      recurso: { tipo: "TURNO_CAJA", id: localId },
    },
    () =>
      api.post(
        `/turno_caja/empezar_turno`,
        { id_caja: data.id_caja, turno: data.turno },
        { headers: { Authorization: `Bearer ${token}` } },
      ),
  );

  if (!estaEncolada(resultado)) return resultado;

  // Marca de turno local: el cierre encolado la lee para saber que este id
  // todavía no existe en el servidor (el sincronizador lo reemplaza por el
  // id real cuando la apertura se sincroniza).
  const usuario = store.getState().auth.usuario;
  if (usuario) {
    await guardarCache(usuario.id, `sync:turno:localQueued:${localId}`, true);
  }

  // El cajero sigue operando con un turno local idéntico al del server
  // (id local, apertura de la operación, caja seleccionada).
  return {
    ...resultado,
    data: {
      id: localId,
      apertura: resultado.fecha,
      turno: data.turno,
      Caja: data.caja ?? null,
    },
    message: "Turno guardado para sincronizar",
  };
};

export const cerrarTurno_Caja = async (
  token: string,
  id_caja: string,
  arqueo?: { numero_sobre?: string | null; efectivo_contado?: number | null },
) => {
  const body = {
    numero_sobre: arqueo?.numero_sobre ?? null,
    efectivo_contado: arqueo?.efectivo_contado ?? null,
  };

  // ¿El turno es local (apertura encolada y aún no sincronizada)? El recurso
  // queda sin servidorId para que el flush espere al mapeo de la apertura; si
  // el turno es real, el id ya sirve para resolver la ruta sin esperar.
  const usuario = store.getState().auth.usuario;
  const marcaTurnoLocal = usuario
    ? await leerCache<boolean>(
        usuario.id,
        `sync:turno:localQueued:${id_caja}`,
      ).catch(() => null)
    : null;
  const esTurnoLocal = Boolean(marcaTurnoLocal);

  return escribir(
    {
      tipo: "TURNO_CAJA_CIERRE",
      metodo: "PUT",
      ruta: "/turno_caja/cerrar_turno/:turnoId",
      body,
      recurso: {
        tipo: "TURNO_CAJA",
        id: id_caja,
        servidorId: esTurnoLocal ? null : id_caja,
      },
    },
    () =>
      api.put(`/turno_caja/cerrar_turno/${id_caja}`, body, {
        headers: { Authorization: `Bearer ${token}` },
      }),
  );
};

/**
 * Abre el **informe de cobros del turno** en PDF, en una pestaña nueva (para
 * imprimir). Es el informe que el cajero emite al cerrar el turno.
 *
 * El PDF lo genera el servidor y requiere el token, así que no se puede usar un
 * `window.open` directo a la URL: se pide como blob y se abre el blob. El
 * `window.open` se hace antes del `await` para no perder el "gesto del usuario"
 * (si no, el navegador bloquea la pestaña emergente).
 */
export const abrirInformeTurnoCaja = async (
  token: string,
  id_turno_caja: string,
  pestaniaAbierta?: Window | null,
) => {
  const pestania = pestaniaAbierta ?? window.open("", "_blank");

  try {
    const res = await api.get(`/turno_caja/${id_turno_caja}/informe.pdf`, {
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
