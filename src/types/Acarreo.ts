import type { Sucursal } from "./Sucursal";
import type { EstadoAcarreo } from "./Vehiculo";

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
}
