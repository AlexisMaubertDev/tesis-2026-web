import type { Acarreo } from "./Acarreo";

/** Playero asignado a un turno de barrera. */
export interface UsuarioTurnoBarrera {
  id: string;
  nombre: string;
  apellido: string;
  legajo: string | number;
  rol: string;
  numero_turno: number;
}

/** Turno de barrera con su barrera y los playeros ya incluidos. */
export interface TurnoBarreraListado {
  id: string;
  id_barrera: string;
  turno: "1" | "2" | "3";
  activo: boolean;
  fecha_inicio: string;
  fecha_fin: string | null;
  incidencias: string | null;
  Barrera?: {
    id: string;
    ubicacion: string;
    Sucursal?: { id: string; nombre: string } | null;
  } | null;
  /** Tabla intermedia `turno_barrera_usuario` con el playero de cada fila. */
  usuarios_asignados?: {
    id: string;
    Usuario?: UsuarioTurnoBarrera | null;
  }[];
  /** Sólo para contar los acarreos del turno en los listados. */
  Acarreos?: { id: string }[];
  /** Entradas y salidas de vehículos de la barrera durante el turno. */
  movimientos?: {
    entradas: number;
    salidas: number;
  };
}

export interface TurnoBarreraDetalle {
  turno: TurnoBarreraListado;
  /** Acarreos que ingresaron a la playa en este turno. */
  acarreos: Acarreo[];
  /** Entradas y salidas de vehículos por la barrera durante el turno. */
  movimientos: MovimientoBarrera[];
  totales: {
    /** Acarreos que ingresaron a la playa durante el turno. */
    ingresos: number;
    /** De ésos, los que además egresaron dentro de la ventana del turno. */
    egresos: number;
    /** Autos que siguen en la playa (estado INGRESADO). */
    enPlaya: number;
    porEstado: {
      ingresados: number;
      cobrados: number;
      egresados: number;
      sinCargo: number;
    };
  };
}

/** Una entrada o una salida de un vehículo por una barrera. */
export interface MovimientoBarrera {
  id: string;
  tipo: "ENTRADA" | "SALIDA";
  fecha: string;
  acarreo: Acarreo;
}
