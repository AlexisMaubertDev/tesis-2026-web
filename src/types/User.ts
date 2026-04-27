export interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  
  role: "PLAYERO" | "CAJERO" | "SUPERVISOR" | "SISTEMAS";
}
