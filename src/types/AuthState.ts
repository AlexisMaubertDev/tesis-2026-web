import type { Usuario } from "./Usuario.ts";

export interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  /**
   * La API rechazó el token (vencido, inválido o usuario eliminado). La
   * sesión se conserva para poder consultar la caché en modo lectura y para
   * no perder la outbox; se pide volver a iniciar sesión para operar.
   */
  sessionExpired: boolean;
}
