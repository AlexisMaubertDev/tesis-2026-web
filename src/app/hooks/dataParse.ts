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
