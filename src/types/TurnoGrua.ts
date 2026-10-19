import type { Acarreo } from "./Acarreo";

/** Usuario que participa de un turno de grúa (chofer, enganchador o supervisor). */
export interface UsuarioTurnoGrua {
  id: string;
  nombre: string;
  apellido: string;
  legajo: string;
  dni: string;
}

/** Turno de grúa con la grúa y los usuarios ya incluidos. */
export interface TurnoGruaListado {
  id: string;
  id_grua: string;
  id_chofer: string;
  id_enganchador: string;
  id_supervisor: string;
  turno: "1" | "2" | "3";
  nombre_agente: string;
  numero_agente: string;
  observaciones: string | null;
  incidencias: string | null;
  activo: boolean;
  fecha_inicio: string;
  fecha_fin: string | null;
  Grua?: {
    id: string;
    patente: string;
    numero: number;
    modelo: string;
    Sucursal?: { id: string; nombre: string } | null;
  } | null;
  chofer?: UsuarioTurnoGrua | null;
  enganchador?: UsuarioTurnoGrua | null;
  supervisor?: UsuarioTurnoGrua | null;
  /** Sólo para contar los acarreos del turno en los listados. */
  Acarreos?: { id: string }[];
}

export interface TurnoGruaDetalle {
  turno: TurnoGruaListado;
  acarreos: Acarreo[];
  totales: {
    cantidad: number;
    ingresados: number;
    cobrados: number;
    egresados: number;
    sinCargo: number;
  };
}
