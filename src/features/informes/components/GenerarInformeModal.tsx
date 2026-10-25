import { Modal } from "@mui/material";
import { useEffect, useState } from "react";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import SelectInput from "../../../components/ui/SelectInput";
import type { Sucursal } from "../../../types/Sucursal";
import type {
  Informe,
  ModoInforme,
  TipoInforme,
} from "../../../types/Informe";
import { obtenerSucursales } from "../../sucursales/services/sucursalesService";
import { obtenerMovimientos } from "../services/informesService";

type Props = {
  open: boolean;
  onClose: () => void;
  token: string | null;
  /** Sistemas administra todas las sucursales: puede filtrar por una. */
  esSistemas: boolean;
  /** El informe de cobros (RF21) lo ven Supervisor y Sistemas. */
  puedeVerCobros: boolean;
  /** El informe de acarreos lo ven Supervisor y Sistemas. */
  puedeVerAcarreos: boolean;
  onGenerado: (informe: Informe) => void;
};

const OPCIONES_MODO = [
  { value: "TURNO", label: "Todas las del turno actual" },
  { value: "RANGO", label: "Entre dos fechas" },
];

/**
 * Modal para generar un informe.
 *
 * Movimientos de autos (RF19/RF20): el flujo es el de la documentación fuente
 * (CU10 / CU11): se elige el tipo (entrada/salida) y el período (turno actual o
 * rango). Cobros (RF21/CU12): el mismo flujo con el tipo "cobros realizados".
 * Acarreos: listado operativo de los acarreos del período. El "turno actual"
 * lo resuelve el servidor según el rol del usuario.
 */
export default function GenerarInformeModal({
  open,
  onClose,
  token,
  esSistemas,
  puedeVerCobros,
  puedeVerAcarreos,
  onGenerado,
}: Props) {
  const opcionesTipo = [
    { value: "ENTRADA", label: "Entrada de vehículos (ingresos)" },
    { value: "SALIDA", label: "Salida de vehículos (egresos)" },
    ...(puedeVerAcarreos
      ? [{ value: "ACARREO", label: "Acarreos realizados" }]
      : []),
    ...(puedeVerCobros
      ? [{ value: "COBRO", label: "Cobros realizados" }]
      : []),
  ];

  const [tipo, setTipo] = useState<TipoInforme>("ENTRADA");
  const [modo, setModo] = useState<ModoInforme>("TURNO");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [desdeHora, setDesdeHora] = useState("00:00");
  const [hastaHora, setHastaHora] = useState("23:59");
  const [sucursal, setSucursal] = useState("");
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sistemas administra todas las sucursales: se cargan para poder filtrar.
  useEffect(() => {
    if (!open || !token || !esSistemas) return;

    let activo = true;

    const cargarSucursales = async () => {
      try {
        const res = await obtenerSucursales(token);
        if (!activo) return;
        setSucursales(res.data ?? []);
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
  }, [open, token, esSistemas]);

  // Al reabrir el modal vuelve al estado inicial.
  const cerrar = () => {
    setTipo("ENTRADA");
    setModo("TURNO");
    setDesde("");
    setHasta("");
    setDesdeHora("00:00");
    setHastaHora("23:59");
    setSucursal("");
    setError(null);
    onClose();
  };

  const handleGenerar = async () => {
    if (!token) return;

    if (modo === "RANGO" && (!desde || !hasta)) {
      setError("Completá las dos fechas del rango.");
      return;
    }

    if (modo === "RANGO" && desde > hasta) {
      setError("La fecha 'desde' no puede ser posterior a 'hasta'.");
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const res = await obtenerMovimientos(token, {
        tipo,
        modo,
        desde: modo === "RANGO" ? desde : undefined,
        hasta: modo === "RANGO" ? hasta : undefined,
        desdeHora: modo === "RANGO" ? desdeHora : undefined,
        hastaHora: modo === "RANGO" ? hastaHora : undefined,
        sucursal: sucursal || undefined,
      });

      onGenerado(res.data);
      cerrar();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "No se pudo generar el informe. Intentá nuevamente.",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal open={open} onClose={cerrar} sx={{ padding: 4 }}>
      <div className="absolute top-1/2 md:top-1/3 left-1/2 w-4/5 md:max-w-lg max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-8 shadow-lg font-sans flex flex-col gap-4">
        <h2 className="text-center text-xl font-bold">Generar informe</h2>

        <p className="text-xs text-center text-cerulean-700">
          Elegí el tipo de informe y el período. Si no elegís un rango de
          fechas, se usa el turno actual.
        </p>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase">Tipo de informe</label>
          <SelectInput
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoInforme)}
            placeholder="Seleccioná el tipo de informe"
            name="tipo"
            options={opcionesTipo}
            disabled={cargando}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase">Período</label>
          <SelectInput
            value={modo}
            onChange={(e) => setModo(e.target.value as ModoInforme)}
            placeholder="Seleccioná el período"
            name="modo"
            options={OPCIONES_MODO}
            disabled={cargando}
          />
        </div>

        {modo === "RANGO" && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-xs font-bold uppercase">Fecha desde</span>
                <input
                  type="date"
                  value={desde}
                  max={hasta || undefined}
                  onChange={(e) => setDesde(e.target.value)}
                  disabled={cargando}
                  className="rounded-lg border border-cerulean-700 bg-cerulean-50 px-2 py-1 text-xs focus-visible:outline-2 focus-visible:outline-cerulean-500"
                />
              </label>
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-xs font-bold uppercase">Hora desde</span>
                <input
                  type="time"
                  value={desdeHora}
                  onChange={(e) => setDesdeHora(e.target.value)}
                  disabled={cargando}
                  className="rounded-lg border border-cerulean-700 bg-cerulean-50 px-2 py-1 text-xs focus-visible:outline-2 focus-visible:outline-cerulean-500"
                />
              </label>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-xs font-bold uppercase">Fecha hasta</span>
                <input
                  type="date"
                  value={hasta}
                  min={desde || undefined}
                  onChange={(e) => setHasta(e.target.value)}
                  disabled={cargando}
                  className="rounded-lg border border-cerulean-700 bg-cerulean-50 px-2 py-1 text-xs focus-visible:outline-2 focus-visible:outline-cerulean-500"
                />
              </label>
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-xs font-bold uppercase">Hora hasta</span>
                <input
                  type="time"
                  value={hastaHora}
                  onChange={(e) => setHastaHora(e.target.value)}
                  disabled={cargando}
                  className="rounded-lg border border-cerulean-700 bg-cerulean-50 px-2 py-1 text-xs focus-visible:outline-2 focus-visible:outline-cerulean-500"
                />
              </label>
            </div>
          </div>
        )}

        {esSistemas && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase">Sucursal</label>
            <SelectInput
              value={sucursal}
              onChange={(e) => setSucursal(e.target.value)}
              placeholder="Todas las sucursales"
              name="sucursal"
              disabled={cargando}
              options={sucursales.map((s) => ({
                value: s.nombre,
                label: s.nombre,
              }))}
            />
          </div>
        )}

        {error && (
          <p className="text-xs text-scarlet-rush-700 text-center">{error}</p>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-2">
          <CallToActionButton
            type="button"
            handleSubmit={cerrar}
            disabled={cargando}
          >
            Cancelar
          </CallToActionButton>
          <CallToActionButton
            type="button"
            handleSubmit={handleGenerar}
            disabled={cargando}
          >
            {cargando ? "Generando..." : "Generar informe"}
          </CallToActionButton>
        </div>
      </div>
    </Modal>
  );
}
