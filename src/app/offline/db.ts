import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { CacheEntry, OutboxItem } from "./types";

/**
 * Persistencia local del modo offline (IndexedDB).
 *
 * - `cache`: respuestas GET por usuario y recurso (vehículos, acarreos por
 *   patente, tarifa vigente, cobros del turno, ...).
 * - `outbox`: operaciones de escritura pendientes de sincronizar.
 *
 * Las claves de caché incluyen el id del usuario para que una misma
 * instalación compartida no mezcle datos entre sesiones.
 */
interface ParkControlDB extends DBSchema {
  cache: {
    key: string;
    value: CacheEntry;
  };
  outbox: {
    key: string;
    value: OutboxItem;
    indexes: {
      "by-usuario": string;
    };
  };
}

const DB_NAME = "parkcontrol-offline";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ParkControlDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<ParkControlDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore("cache");
        const outbox = db.createObjectStore("outbox", { keyPath: "id" });
        outbox.createIndex("by-usuario", "usuarioId");
      },
    });
  }

  return dbPromise;
};

const claveCache = (usuarioId: string, resourceKey: string) =>
  `${usuarioId}:${resourceKey}`;

export const leerCache = async <T>(
  usuarioId: string,
  resourceKey: string,
): Promise<CacheEntry<T> | null> => {
  try {
    const db = await getDB();
    const entry = await db.get("cache", claveCache(usuarioId, resourceKey));
    return (entry as CacheEntry<T> | undefined) ?? null;
  } catch (error) {
    console.error("Offline: no se pudo leer la caché:", error);
    return null;
  }
};

export const guardarCache = async <T>(
  usuarioId: string,
  resourceKey: string,
  data: T,
): Promise<void> => {
  try {
    const db = await getDB();
    const entry: CacheEntry<T> = {
      key: claveCache(usuarioId, resourceKey),
      usuarioId,
      data,
      actualizadoEn: new Date().toISOString(),
    };
    // El store `cache` usa claves out-of-line: la clave se pasa como tercer
    // parámetro del `put` (si no, IndexedDB lanza DataError).
    await db.put("cache", entry, entry.key);
  } catch (error) {
    console.error("Offline: no se pudo guardar la caché:", error);
  }
};

export const borrarCache = async (
  usuarioId: string,
  resourceKey: string,
): Promise<void> => {
  try {
    const db = await getDB();
    await db.delete("cache", claveCache(usuarioId, resourceKey));
  } catch (error) {
    console.error("Offline: no se pudo borrar la caché:", error);
  }
};

/**
 * Borra todas las entradas de un usuario cuya clave empiece con el prefijo
 * indicado. Se usa para invalidar, por ejemplo, todos los `acarreos:patente:*`
 * después de una escritura.
 */
export const borrarCachePorPrefijo = async (
  usuarioId: string,
  prefijo: string,
): Promise<void> => {
  try {
    const db = await getDB();
    const tx = db.transaction("cache", "readwrite");
    const claves = await tx.store.getAllKeys();
    const prefijoCompleto = `${usuarioId}:${prefijo}`;

    await Promise.all(
      claves
        .filter((clave) => clave.startsWith(prefijoCompleto))
        .map((clave) => tx.store.delete(clave)),
    );
    await tx.done;
  } catch (error) {
    console.error("Offline: no se pudo invalidar la caché:", error);
  }
};

export const listarOutbox = async (
  usuarioId: string,
): Promise<OutboxItem[]> => {
  try {
    const db = await getDB();
    return await db.getAllFromIndex("outbox", "by-usuario", usuarioId);
  } catch (error) {
    console.error("Offline: no se pudo leer la outbox:", error);
    return [];
  }
};

export const guardarOutbox = async (item: OutboxItem): Promise<void> => {
  const db = await getDB();
  await db.put("outbox", item);
};

export const obtenerOutbox = async (
  id: string,
): Promise<OutboxItem | null> => {
  try {
    const db = await getDB();
    return (await db.get("outbox", id)) ?? null;
  } catch (error) {
    console.error("Offline: no se pudo leer la operación:", error);
    return null;
  }
};

export const borrarOutbox = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete("outbox", id);
};

export const limpiarOutboxUsuario = async (
  usuarioId: string,
): Promise<void> => {
  try {
    const db = await getDB();
    const items = await db.getAllFromIndex("outbox", "by-usuario", usuarioId);
    const tx = db.transaction("outbox", "readwrite");
    await Promise.all([
      ...items.map((item) => tx.store.delete(item.id)),
      tx.done,
    ]);
  } catch (error) {
    console.error("Offline: no se pudo limpiar la outbox:", error);
  }
};
