import type { Usuario } from "./Usuario.ts";

export interface AuthState {
  usuario: Usuario | null;
  token: string | null;
}
