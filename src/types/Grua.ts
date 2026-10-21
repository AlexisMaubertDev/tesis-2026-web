import type { Sucursal } from "./Sucursal";
import type { Usuario } from "./Usuario";

export interface Grua {
  id: string;
  Sucursal: Sucursal;
  patente: string;
  numero: number;
  modelo: string;
  estado: "DISPONIBLE" | "EN_SERVICIO" | "FUERA_DE_SERVICIO" | "MANTENIMIENTO";
  incidencias: string | null;
  Turno_Gruas: Turno_Grua[];
  turno_grua_activo: Turno_Grua | null;
}

export interface Turno_Grua {
  id?: string | null;
  Grua: Grua | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  id_enganchador: string | null;
  id_chofer: string | null;
  chofer?: Usuario | null;
  enganchador?: Usuario | null;
  supervisor?: Usuario | null;
  id_supervisor?: string | null;
  nombre_agente: string | null;
  numero_agente: string | null;
  incidencias?: string | null;
  turno: "1" | "2" | "3" | "";
}
