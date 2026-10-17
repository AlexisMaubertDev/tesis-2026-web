import type { Sucursal } from "./Sucursal";
import type { EstadoAcarreo } from "./Vehiculo";

/** Usuario tal como lo devuelven los includes de acarreos (sin la contraseña). */
export interface AcarreoUsuario {
  id: string;
  nombre: string;
  apellido: string;
  legajo: number;
  dni: string;
  rol: string;
}

export interface AcarreoGrua {
  id: string;
  turno: string;
  nombre_agente: string;
  numero_agente: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  Grua?: {
    id: string;
    patente: string;
    Sucursal?: Sucursal | null;
  } | null;
  chofer?: AcarreoUsuario | null;
  enganchador?: AcarreoUsuario | null;
  supervisor?: AcarreoUsuario | null;
}

export interface AcarreoBarrera {
  id: string;
  turno: string;
  activo: boolean;
  fecha_inicio: string;
  fecha_fin: string;
  Barrera?: {
    id: string;
    ubicacion: string;
    Sucursal?: { id: string; nombre: string } | null;
  } | null;
  /** Asignados al turno de barrera (`turno_barrera_usuario`). */
  usuarios_asignados?: {
    id: string;
    Usuario?: AcarreoUsuario | null;
  }[];
}

export interface Acarreo {
  id: string;
  id_vehiculo: string;
  fecha_acarreo: string;
  fecha_ingreso: string | null;
  fecha_egreso: string | null;
  numero_acta: number | null;
  estado: EstadoAcarreo;
  direccion: string;
  motivo: string;
  fue_denuncia: boolean;
  tuvo_siniestro: boolean;
  observaciones: string | null;
  incidencias: string | null;
  Turno_Grua?: AcarreoGrua | null;
  /**
   * Turno de barrera por el que ingresó. El nombre de la clave lo define
   * Sequelize con el nombre del modelo (`turno_barrera`, en minúsculas).
   */
  turno_barrera?: AcarreoBarrera | null;
}
