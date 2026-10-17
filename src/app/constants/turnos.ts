// El backend guarda el turno como código ("1", "2", "3").
// Este helper centraliza las etiquetas que ve el usuario.
export const TURNOS = {
  "1": "Mañana",
  "2": "Tarde",
  "3": "Noche",
} as const;

export const TURNOS_OPTIONS = Object.entries(TURNOS).map(([value, label]) => ({
  value,
  label,
}));

export const getTurnoLabel = (turno?: string | null): string => {
  if (!turno) return "-";
  return TURNOS[turno as keyof typeof TURNOS] ?? turno;
};
