export interface Usuario {
  id: string;
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
    id: string;
    direccion: string;
  };

  rol: "PLAYERO" | "CAJERO" | "SUPERVISOR" | "SISTEMAS";
}
