import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";

const DEFAULT_TIMEZONE = "America/Argentina/Buenos_Aires";

export function formatDateFullWithHs(
  dateString: string | null | undefined,
): string {
  if (!dateString) return "";
  const date = toZonedTime(new Date(dateString), DEFAULT_TIMEZONE);
  return `${format(date, "dd/MM/yyyy HH:mm", { locale: es })}hs`;
}

// Fecha con hora en formato `dd/MM/yyyy HH:mm` (sin el sufijo "hs"). Lo usa
// el historial de vehículos, que replica el diseño del móvil.
export function formatDateHours(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = toZonedTime(new Date(dateString), DEFAULT_TIMEZONE);
  return format(date, "dd/MM/yyyy HH:mm", { locale: es });
}

export function formatDateFull(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = toZonedTime(new Date(dateString), DEFAULT_TIMEZONE);
  return format(date, "dd/MM/yyyy", { locale: es });
}

export function formatTime(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = toZonedTime(new Date(dateString), DEFAULT_TIMEZONE);
  return format(date, "HH:mm", { locale: es });
}

// Fecha en formato `yyyy-MM-dd` (el que usan los <input type="date">), calculada
// en la zona horaria del país para poder compararla con los filtros.
export function toFechaInput(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = toZonedTime(new Date(dateString), DEFAULT_TIMEZONE);
  return format(date, "yyyy-MM-dd");
}

// Indica si una fecha cae dentro del rango [desde, hasta] (ambos inclusive),
// con `desde`/`hasta` en formato `yyyy-MM-dd`. Sin filtros, siempre entra.
export function enRangoDeFechas(
  dateString: string | null | undefined,
  desde: string,
  hasta: string,
): boolean {
  const fecha = toFechaInput(dateString);
  if (!fecha) return false;
  if (desde && fecha < desde) return false;
  if (hasta && fecha > hasta) return false;
  return true;
}
