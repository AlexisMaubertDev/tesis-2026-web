import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../../app/store";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import { formatDateHours } from "../../../app/hooks/dataParse";
import type { Vehiculo } from "../../../types/Vehiculo";
import { obtenerVehiculos } from "../services/vehiculosService";

/** Fila "etiqueta / valor" del resultado, con el diseño del móvil. */
function Row({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between items-start gap-3 text-xs border-b border-cerulean-300 py-1">
      <span className="font-semibold text-cerulean-800 whitespace-nowrap">
        {etiqueta}:
      </span>
      <span className="text-cerulean-900 text-right break-words">{valor}</span>
    </div>
  );
}

/**
 * Buscador por patente estilo móvil: se escribe la patente, se busca y, si
 * existe, se muestra una tarjeta con los datos del vehículo y un botón para
 * abrir su historial de acarreos. Lo usan las pantallas de cajero y supervisor.
 */
export default function BuscarVehiculoPatente() {
  const { token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const [patente, setPatente] = useState("");
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [buscado, setBuscado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const irAlHistorial = (p: string) =>
    navigate(`/vehiculos/${encodeURIComponent(p)}/historial`);

  const handleBuscar = async () => {
    const consulta = patente.trim().toUpperCase();

    if (!consulta) {
      setError("Ingresá una patente");
      return;
    }

    setLoading(true);
    setError(null);
    setVehiculo(null);
    setBuscado(false);

    try {
      const res = await obtenerVehiculos(token!);
      const encontrado = (res.data as Vehiculo[]).find(
        (v) => v.patente.toUpperCase() === consulta,
      );
      setVehiculo(encontrado ?? null);
      setBuscado(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "No se pudo buscar el vehículo. Intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full bg-cerulean-100 rounded shadow p-4 flex flex-col gap-3">
        <h2 className="sm:text-lg font-bold uppercase">Buscar por patente</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center max-w-xl">
          <input
            className="w-full p-3 border border-cerulean-700 rounded-lg bg-cerulean-50 text-xs uppercase focus-visible:outline-2 focus-visible:outline-cerulean-500"
            type="text"
            placeholder="Ingresar patente"
            value={patente}
            onChange={(e) => setPatente(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleBuscar();
            }}
          />
          <CallToActionButton
            type="button"
            handleSubmit={handleBuscar}
            disabled={loading}
          >
            {loading ? "Buscando..." : "Buscar"}
          </CallToActionButton>
        </div>

        {error && <p className="text-xs text-red-900">{error}</p>}
      </div>

      {buscado && !vehiculo && (
        <div className="w-full max-w-xl bg-cerulean-200 rounded-lg p-4 text-xs text-cerulean-900">
          No existe un vehículo con la patente{" "}
          <span className="font-bold">{patente.trim().toUpperCase()}</span>.
        </div>
      )}

      {vehiculo && (
        <div className="w-full max-w-xl bg-cerulean-200 rounded-lg p-4 flex flex-col gap-1">
          <h3 className="text-lg font-bold text-cerulean-900 mb-1">
            {vehiculo.patente}
          </h3>
          <Row etiqueta="Marca" valor={vehiculo.marca} />
          <Row etiqueta="Modelo" valor={vehiculo.modelo} />
          <Row etiqueta="Color" valor={vehiculo.color} />
          <Row etiqueta="Sucursal" valor={vehiculo.Sucursal?.nombre ?? "-"} />
          <Row etiqueta="Estado" valor={vehiculo.ultimo_acarreo_estado ?? "-"} />
          <Row
            etiqueta="Cantidad de acarreos"
            valor={String(vehiculo.cantidad_acarreos ?? 0)}
          />
          <Row
            etiqueta="Último acarreo"
            valor={
              vehiculo.ultimo_acarreo
                ? formatDateHours(vehiculo.ultimo_acarreo)
                : "Sin acarreos"
            }
          />

          <div className="mt-3">
            <CallToActionButton
              type="button"
              handleSubmit={() => irAlHistorial(vehiculo.patente)}
            >
              Ver historial
            </CallToActionButton>
          </div>
        </div>
      )}
    </div>
  );
}
