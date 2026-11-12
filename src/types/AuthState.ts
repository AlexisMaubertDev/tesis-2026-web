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
  /**
   * El usuario entró "sin sistema" como invitado (sin credenciales ni token):
   * sólo puede operar cobrar / ingresar / dar salida y todo queda encolado en
   * el dispositivo bajo el usuario pseudo `invitado`.
   */
  invitadoOffline: boolean;
}
