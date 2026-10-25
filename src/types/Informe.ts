/**
 * Tipos de los informes del sistema.
 *
 * Movimientos de autos (RF19 / RF20): "ingresos" son los autos que ENTRARON a
 * la playa y "egresos" los que SALIERON (CU11 / CU10). No son sumas de dinero:
 * eso es RF21 (los cobros).
 */

import type { EstadoAcarreo } from "./Vehiculo";

export type TipoMovimiento = "ENTRADA" | "SALIDA";

/** Tipos de informe que ofrece el módulo. */
export type TipoInforme = TipoMovimiento | "COBRO" | "ACARREO";

export type ModoInforme = "TURNO" | "RANGO";

/** Cobro asociado al movimiento (si el vehículo ya fue cobrado). */
export interface CobroInforme {
  id: string;
  total: number;
  efectivo: number;
  mp: number;
  fecha: string;
  numero_factura: string | null;
  estadias: number | null;
}

/** Playero asignado al turno de barrera. */
export interface PlayeroInforme {
  id: string | null;
  nombre: string | null;
  apellido: string | null;
  legajo: number | null;
  nombre_completo: string | null;
}

/** Un auto que entró o salió de la playa en el período del informe. */
export interface MovimientoInforme {
  id: string;
  /** Fecha del movimiento (de ingreso o de egreso, según el tipo). */
  fecha: string;
  patente: string;
  marca: string | null;
  modelo: string | null;
  color: string | null;
  /** Estado actual del vehículo (INGRESADO, EGRESADO, COBRADO, SIN_CARGO...). */
  estado: string | null;
  motivo: string | null;
  direccion: string | null;
  barrera: string | null;
  sucursal: string | null;
  turno_barrera: {
    id: string;
    turno: string;
    fecha_inicio: string;
    fecha_fin: string | null;
  } | null;
  playeros: PlayeroInforme[];
  grua: {
    id: string;
    patente: string;
    numero: number | null;
  } | null;
  chofer: string | null;
  enganchador: string | null;
  cobro: CobroInforme | null;
}

export interface TotalesInforme {
  cantidad: number;
  cobrados: number;
  sinCargo: number;
  totalCobrado: number;
}

/** Un cobro realizado en el período (informe de cobros, RF21 / CU12). */
export interface CobroInformeFila {
  id: string;
  fecha: string;
  patente: string;
  marca: string | null;
  modelo: string | null;
  color: string | null;
  estadias: number | null;
  total: number;
  efectivo: number;
  mp: number;
  numero_factura: string | null;
  motivo: string | null;
  fecha_acarreo: string | null;
  caja: {
    id: string;
    numero_caja: number;
    referencia: string;
  } | null;
  sucursal: string | null;
  cajero: string | null;
  turno_caja: string | null;
}

export interface TotalesCobros {
  cantidad: number;
  estadias: number;
  total: number;
  efectivo: number;
  mp: number;
}

export interface InformeMovimientos {
  tipo: TipoMovimiento;
  modo: ModoInforme;
  titulo: string;
  etiquetaFecha: string;
  sucursales: { id: string; nombre: string }[];
  sucursal: { id: string | null; nombre: string };
  periodo: {
    desde: string;
    hasta: string;
    descripcion: string;
  };
  movimientos: MovimientoInforme[];
  totales: TotalesInforme;
}

/** Informe de cobros (RF21 / CU12): lo recaudado en el período. */
export interface InformeCobros {
  tipo: "COBRO";
  modo: ModoInforme;
  titulo: string;
  etiquetaFecha: string;
  etiquetaImporte: string;
  sucursales: { id: string; nombre: string }[];
  sucursal: { id: string | null; nombre: string };
  periodo: {
    desde: string;
    hasta: string;
    descripcion: string;
  };
  movimientos: CobroInformeFila[];
  totales: TotalesCobros;
}

/** Un acarreo realizado en el período (informe de acarreos). */
export interface AcarreoInforme {
  id: string;
  fecha: string;
  patente: string;
  marca: string | null;
  modelo: string | null;
  color: string | null;
  estado: EstadoAcarreo | null;
  motivo: string | null;
  direccion: string | null;
  numero_acta: number | null;
  tuvo_siniestro: boolean | null;
  fue_denuncia: boolean | null;
  sucursal: string | null;
  grua: {
    id: string;
    patente: string;
    numero: number | null;
  } | null;
  chofer: string | null;
  enganchador: string | null;
  supervisor: string | null;
  personal: string | null;
  turno_grua: {
    id: string;
    turno: string;
    fecha_inicio: string;
    fecha_fin: string | null;
  } | null;
}

export interface TotalesAcarreos {
  cantidad: number;
  enPlaya: number;
  cobrados: number;
  sinCargo: number;
  egresados: number;
}

/** Informe operativo de acarreos realizados en el período. */
export interface InformeAcarreos {
  tipo: "ACARREO";
  modo: ModoInforme;
  titulo: string;
  etiquetaFecha: string;
  sucursales: { id: string; nombre: string }[];
  sucursal: { id: string | null; nombre: string };
  periodo: {
    desde: string;
    hasta: string;
    descripcion: string;
  };
  movimientos: AcarreoInforme[];
  totales: TotalesAcarreos;
}

/** Un informe cualquiera, discriminado por `tipo`. */
export type Informe = InformeMovimientos | InformeCobros | InformeAcarreos;

export type ParametrosInforme = {
  tipo: TipoInforme;
  modo: ModoInforme;
  /** `yyyy-MM-dd`. Sólo se usa en modo RANGO. */
  desde?: string;
  hasta?: string;
  /** `HH:mm`. Sólo se usa en modo RANGO. */
  desdeHora?: string;
  hastaHora?: string;
  /** Nombre de la sucursal. Sólo lo usa Sistemas (administra todas). */
  sucursal?: string;
};

/** Período del informe detallado de fin de turno. */
export type PeriodoFinTurno = "MANANA" | "TARDE" | "NOCHE" | "RANGO";

/**
 * Parámetros del informe de fin de turno (detallado). Los turnos fijos usan
 * `fecha`; el rango usa `desde`/`hasta` y horas opcionales.
 */
export type ParametrosFinTurno = {
  periodo: PeriodoFinTurno;
  /** `yyyy-MM-dd` para los turnos fijos (fecha de inicio del turno). */
  fecha?: string;
  /** `yyyy-MM-dd` para el rango. */
  desde?: string;
  hasta?: string;
  /** `HH:mm` para el rango. */
  desdeHora?: string;
  hastaHora?: string;
  /** Nombre de la sucursal. Sólo lo usa Sistemas. */
  sucursal?: string;
};
