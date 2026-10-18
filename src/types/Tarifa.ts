/** Tarifa de la playa (acarreo + cada estadía). Sólo una está vigente a la vez. */
export type Tarifa = {
  id: string;
  acarreo: number;
  estadia: number;
  vigente: boolean;
  vigente_desde: string;
  vigente_hasta: string | null;
};
