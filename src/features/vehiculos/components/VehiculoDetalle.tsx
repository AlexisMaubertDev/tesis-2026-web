import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import DetailItem from "../../../components/ui/DetailItem";
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

      {loading && (
        <p className="text-xs text-cerulean-700">Cargando acarreos...</p>
      )}

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
 * Datos del vehículo y el historial de sus acarreos, como los muestra el modal
 * "Ver más" (`VehiculoDetalleModal`).
 */
export default function VehiculoDetalle({
  vehiculo,
  acarreos,
  loading,
  error,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <DatosVehiculo vehiculo={vehiculo} />
      <div className="flex flex-col gap-2 mt-4">
        <ListaAcarreos acarreos={acarreos} loading={loading} error={error} />
      </div>
    </div>
  );
}
