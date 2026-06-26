export interface CajaForm {
  numero_caja: number;
  referencia: string;
  referencia_pago: string;
}

export interface BarreraForm {
  ubicacion: string;
}

export interface GruaForm {
  patente: string;
  modelo: string;
  numero: number | "";
}

export interface NuevaSucursalForm {
  id?: string;
  nombre: string;
  direccion: string;
  Cajas: CajaForm[];
  Barreras: BarreraForm[];
  Gruas: GruaForm[];
}

export const defaultSucursalForm: NuevaSucursalForm = {
  nombre: "",
  direccion: "",
  Cajas: [],
  Barreras: [],
  Gruas: [],
};
