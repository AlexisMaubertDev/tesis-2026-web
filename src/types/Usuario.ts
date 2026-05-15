export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  legajo: string;
  dni: string;
  email: string | null;
  numero_turno: number;
  trabaja_domingo: boolean;
  bloqueado: boolean;
  Sucursal: {
    nombre: string;
  };

  rol: "PLAYERO" | "CAJERO" | "SUPERVISOR" | "SISTEMAS";
}
