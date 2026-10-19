type Props = {
  desde: string;
  hasta: string;
  setDesde: (value: string) => void;
  setHasta: (value: string) => void;
};

/**
 * Filtro "desde / hasta" con dos `<input type="date">`. Lo usan los modales de
 * historial de turnos (cajas, grúas, barreras y usuarios) para acotar por fecha.
 */
export default function FiltroFechas({
  desde,
  hasta,
  setDesde,
  setHasta,
}: Props) {
  const hayFiltro = Boolean(desde || hasta);

  return (
    <div className="flex flex-wrap items-end justify-center gap-3 text-xs">
      <label className="flex flex-col gap-1">
        <span className="font-bold uppercase">Desde</span>
        <input
          type="date"
          value={desde}
          max={hasta || undefined}
          onChange={(e) => setDesde(e.target.value)}
          className="rounded-lg border border-cerulean-700 bg-cerulean-50 px-2 py-1 focus-visible:outline-2 focus-visible:outline-cerulean-500"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-bold uppercase">Hasta</span>
        <input
          type="date"
          value={hasta}
          min={desde || undefined}
          onChange={(e) => setHasta(e.target.value)}
          className="rounded-lg border border-cerulean-700 bg-cerulean-50 px-2 py-1 focus-visible:outline-2 focus-visible:outline-cerulean-500"
        />
      </label>

      {hayFiltro && (
        <button
          type="button"
          onClick={() => {
            setDesde("");
            setHasta("");
          }}
          className="cursor-pointer rounded-lg bg-cerulean-200 px-3 py-1 font-bold uppercase hover:bg-cerulean-300"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}
