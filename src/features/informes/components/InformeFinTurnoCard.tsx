import { useEffect, useState } from "react";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import SelectInput from "../../../components/ui/SelectInput";
import type { Sucursal } from "../../../types/Sucursal";
import type { PeriodoFinTurno } from "../../../types/Informe";
import { obtenerSucursales } from "../../sucursales/services/sucursalesService";
import { abrirInformeFinTurno } from "../services/informesService";

type Props = {
  token: string | null;
  /** Sistemas administra todas: tiene que elegir la sucursal del informe. */
  esSistemas: boolean;
};

const OPCIONES_PERIODO = [
  { value: "MANANA", label: "Turno mañana (07:00 a 15:00)" },
  { value: "TARDE", label: "Turno tarde (15:00 a 23:00)" },
  { value: "NOCHE", label: "Turno noche (23:00 a 07:00)" },
  { value: "RANGO", label: "Rango de fechas" },
];

const CLASE_INPUT =
  "w-full rounded-lg border border-cerulean-700 bg-cerulean-50 p-2 text-xs focus-visible:outline-2 focus-visible:outline-cerulean-500";

/** Fecha de hoy en formato `yyyy-MM-dd` (hora local del navegador). */
const fechaDeHoy = () => {
  const d = new Date();
  const dosDigitos = (n: number) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(
    d.getDate(),
  )}`;
};

/**
 * Tarjeta para generar el **informe detallado de fin de turno** (supervisor y
 * sistemas). Permite elegir uno de los tres turnos fijos o un rango de fechas.
 *
 * El PDF se genera en el servidor y se abre en otra pestaña. Es el único
 * informe con la cuenta de vehículos por estado; los cierres de turno no la
 * muestran.
 */
export default function InformeFinTurnoCard({ token, esSistemas }: Props) {
  const [periodo, setPeriodo] = useState<PeriodoFinTurno>("MANANA");
  const [fecha, setFecha] = useState(fechaDeHoy);
  const [desde, setDesde] = useState(fechaDeHoy);
  const [hasta, setHasta] = useState(fechaDeHoy);
  const [desdeHora, setDesdeHora] = useState("00:00");
  const [hastaHora, setHastaHora] = useState("23:59");
  const [sucursal, setSucursal] = useState("");
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!esSistemas || !token) return;

    let activo = true;

    const cargarSucursales = async () => {
      try {
        const res = await obtenerSucursales(token);
        if (!activo) return;

        const lista: Sucursal[] = res.data ?? [];
        setSucursales(lista);

        if (lista.length > 0) {
          setSucursal((actual) => actual || lista[0].nombre);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (!activo) return;
        console.error(err.response?.data);
      }
    };

    cargarSucursales();

    return () => {
      activo = false;
    };
  }, [esSistemas, token]);

  const handleGenerar = async () => {
    if (!token) return;

    if (periodo === "RANGO") {
      if (!desde || !hasta) {
        setError("Completá las dos fechas del rango.");
        return;
      }

      if (desde > hasta) {
        setError("La fecha 'desde' no puede ser posterior a 'hasta'.");
        return;
      }

      if (desde === hasta && desdeHora > hastaHora) {
        setError("La hora 'desde' no puede ser posterior a la hora 'hasta'.");
        return;
      }
    }

    if (esSistemas && !sucursal) {
      setError("Elegí la sucursal del informe.");
      return;
    }

    setGenerando(true);
    setError(null);

    try {
      await abrirInformeFinTurno(token, {
        periodo,
        fecha: periodo === "RANGO" ? undefined : fecha,
        desde: periodo === "RANGO" ? desde : undefined,
        hasta: periodo === "RANGO" ? hasta : undefined,
        desdeHora: periodo === "RANGO" ? desdeHora : undefined,
        hastaHora: periodo === "RANGO" ? hastaHora : undefined,
        sucursal: esSistemas ? sucursal : undefined,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "No se pudo generar el informe de fin de turno. Intentá nuevamente.",
      );
    } finally {
      setGenerando(false);
    }
  };

  return (
    <section className="w-full mt-4 rounded-lg bg-cerulean-100 shadow p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold uppercase">
          Informe de fin de turno (detallado)
        </h2>
        <p className="text-xs text-cerulean-700">
          Todos los movimientos de la sucursal en un turno o en un rango:
          vehículos por estado, movimientos por barrera, acarreos por grúa y
          cobros por caja. Sólo supervisores y sistemas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase">Período</span>
          <SelectInput
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as PeriodoFinTurno)}
            placeholder="Seleccioná el período"
            name="periodo_fin_turno"
            options={OPCIONES_PERIODO}
            disabled={generando}
          />
        </label>

        {periodo !== "RANGO" && (
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase">Fecha del turno</span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              disabled={generando}
              className={CLASE_INPUT}
            />
          </label>
        )}

        {esSistemas && (
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase">Sucursal</span>
            <SelectInput
              value={sucursal}
              onChange={(e) => setSucursal(e.target.value)}
              placeholder="Seleccioná la sucursal"
              name="sucursal_fin_turno"
              disabled={generando}
              options={sucursales.map((s) => ({
                value: s.nombre,
                label: s.nombre,
              }))}
            />
          </label>
        )}
      </div>

      {periodo === "NOCHE" && (
        <p className="text-[11px] text-cerulean-700">
          El turno noche va de las 23:00 de la fecha elegida a las 07:00 del día
          siguiente.
        </p>
      )}

      {periodo === "RANGO" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase">Fecha desde</span>
            <input
              type="date"
              value={desde}
              max={hasta || undefined}
              onChange={(e) => setDesde(e.target.value)}
              disabled={generando}
              className={CLASE_INPUT}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase">Hora desde</span>
            <input
              type="time"
              value={desdeHora}
              onChange={(e) => setDesdeHora(e.target.value)}
              disabled={generando}
              className={CLASE_INPUT}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase">Fecha hasta</span>
            <input
              type="date"
              value={hasta}
              min={desde || undefined}
              onChange={(e) => setHasta(e.target.value)}
              disabled={generando}
              className={CLASE_INPUT}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase">Hora hasta</span>
            <input
              type="time"
              value={hastaHora}
              onChange={(e) => setHastaHora(e.target.value)}
              disabled={generando}
              className={CLASE_INPUT}
            />
          </label>
        </div>
      )}

      {error && (
        <p className="text-xs text-scarlet-rush-700 text-center">{error}</p>
      )}

      <div className="flex justify-end">
        <CallToActionButton
          type="button"
          handleSubmit={handleGenerar}
          disabled={generando || (esSistemas && !sucursal)}
        >
          {generando ? "Generando PDF..." : "Generar informe PDF"}
        </CallToActionButton>
      </div>
    </section>
  );
}
