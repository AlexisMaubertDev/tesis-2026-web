import { Link } from "react-router-dom";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import DetailItem from "../../../components/ui/DetailItem";
import SkeletonCarga from "../../../components/ui/SkeletonCarga";
import type { Acarreo } from "../../../types/Acarreo";
import type { Vehiculo } from "../../../types/Vehiculo";
import AcarreoDetalleCard from "./AcarreoDetalleCard";

/** Datos del vehículo. */
export function DatosVehiculo({ vehiculo }: { vehiculo: Vehiculo | null }) {
  return (
    <>
      <h3 className="text-sm font-bold uppercase mt-2">Datos</h3>
      <DetailItem etiqueta="Patente" valor={vehiculo?.patente} />
      <DetailItem etiqueta="Sucursal" valor={vehiculo?.Sucursal?.nombre} />
      <DetailItem etiqueta="Marca" valor={vehiculo?.marca} />
      <DetailItem etiqueta="Modelo" valor={vehiculo?.modelo} />
      <DetailItem etiqueta="Color" valor={vehiculo?.color} />
      <DetailItem
        etiqueta="Cantidad de acarreos"
        valor={String(vehiculo?.cantidad_acarreos ?? 0)}
      />
      <DetailItem
        etiqueta="Estado"
        valor={vehiculo?.ultimo_acarreo_estado ?? "-"}
      />
      <DetailItem
        etiqueta="Último acarreo"
        valor={
          vehiculo?.ultimo_acarreo
            ? formatDateFullWithHs(vehiculo.ultimo_acarreo)
            : "Sin acarreos"
        }
      />
    </>
  );
}

type ListaProps = {
  acarreos: Acarreo[];
  loading: boolean;
  error: string | null;
};

/**
 * Lista de acarreos del vehículo. La usan el modal "Ver más" (junto con
 * `DatosVehiculo`) y la página de historial, que muestra sólo esta lista.
 */
export function ListaAcarreos({ acarreos, loading, error }: ListaProps) {
  return (
    <>
      <h3 className="text-sm font-bold uppercase">
        {`Acarreos ${acarreos.length > 0 ? `(${acarreos.length})` : ""}`.trim()}
      </h3>

      {loading && <SkeletonCarga filas={3} alto={56} />}

      {!loading && error && (
        <p className="text-xs text-scarlet-rush-700">{error}</p>
      )}

      {!loading && !error && acarreos.length === 0 && (
        <p className="text-xs text-cerulean-700">Sin acarreos registrados.</p>
      )}

      <div className="flex flex-col gap-2">
        {acarreos.map((acarreo) => (
          <AcarreoDetalleCard key={acarreo.id} acarreo={acarreo} />
        ))}
      </div>
    </>
  );
}

type Props = {
  vehiculo: Vehiculo | null;
  acarreos: Acarreo[];
  loading: boolean;
  error: string | null;
};

/**
 * Datos del vehículo y **sólo el último acarreo**, como los muestra el modal
 * "Ver más" (`VehiculoDetalleModal`). El resto del historial se ve en la
 * página de historial (`HistorialVehiculoPage`), con todos los acarreos.
 */
export default function VehiculoDetalle({
  vehiculo,
  acarreos,
  loading,
  error,
}: Props) {
  // La lista viene ordenada DESC del server: el último acarreo es el primero.
  const ultimo = acarreos[0] ?? null;

  return (
    <div className="flex flex-col gap-2">
      <DatosVehiculo vehiculo={vehiculo} />
      <h3 className="text-sm font-bold uppercase">Último acarreo</h3>
      {loading && <SkeletonCarga filas={1} alto={120} />}
      {!loading && error && <p className="text-xs text-scarlet-rush-700">{error}</p>}
      {!loading && !error && !ultimo && (
        <p className="text-xs text-cerulean-700">Sin acarreos registrados.</p>
      )}
      {!loading && !error && ultimo && (
        <AcarreoDetalleCard acarreo={ultimo} />
      )}

      {vehiculo?.patente && !loading && (
        <Link
          to={`/vehiculos/${encodeURIComponent(vehiculo.patente)}/historial`}
          className="text-xs font-bold text-cerulean-700 hover:text-cerulean-500 underline mt-2 self-start"
        >
          Ver historial completo (todos los acarreos)
        </Link>
      )}
    </div>
  );
}
