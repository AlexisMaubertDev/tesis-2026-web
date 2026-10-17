import Modal from "@mui/material/Modal";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { getTurnoLabel } from "../../../app/constants/turnos";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import type { Acarreo } from "../../../types/Acarreo";
import type { Vehiculo } from "../../../types/Vehiculo";
import { obtenerAcarreosPorPatente } from "../services/vehiculosService";

type Props = {
  open: boolean;
  onClose: () => void;
  vehiculo: Vehiculo | null;
};

function Dato({
  etiqueta,
  valor,
}: {
  etiqueta: string;
  valor: React.ReactNode;
}) {
  return (
    <div className="flex gap-2 items-start text-xs">
      <span className="w-2/5 bg-cerulean-200 text-white px-2 py-1 font-bold rounded">
        {etiqueta}
      </span>
      <span className="w-3/5 bg-cerulean-50 px-2 py-1 rounded break-words">
        {valor || "-"}
      </span>
    </div>
  );
}

export default function VehiculoDetalleModal({
  open,
  onClose,
  vehiculo,
}: Props) {
  const { token } = useSelector((state: RootState) => state.auth);
  const [acarreos, setAcarreos] = useState<Acarreo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patente = vehiculo?.patente;

  useEffect(() => {
    if (!open || !patente || !token) return;

    let activo = true;

    const cargarAcarreos = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await obtenerAcarreosPorPatente(token, patente);
        if (activo) setAcarreos(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (activo) {
          setError(
            err.response?.data?.message ||
              "Error al cargar los acarreos. Intenta nuevamente más tarde.",
          );
        }
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarAcarreos();

    return () => {
      activo = false;
    };
  }, [open, patente, token]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ padding: 4, overflowY: "auto" }}
    >
      <div className="absolute top-1/2 md:top-1/3 left-1/2 w-full max-w-4/5 md:max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans">
        <h2 className="text-center font-bold uppercase">
          {`Detalle del vehículo ${vehiculo?.patente ?? ""}`}
        </h2>

        <div className="flex flex-col gap-2 mt-4">
          <h3 className="text-sm font-bold uppercase mt-2">Datos</h3>
          <Dato etiqueta="Patente" valor={vehiculo?.patente} />
          <Dato etiqueta="Marca" valor={vehiculo?.marca} />
          <Dato etiqueta="Modelo" valor={vehiculo?.modelo} />
          <Dato etiqueta="Color" valor={vehiculo?.color} />
          <Dato etiqueta="Sucursal" valor={vehiculo?.Sucursal?.nombre} />
          <Dato
            etiqueta="Cantidad de acarreos"
            valor={vehiculo?.cantidad_acarreos ?? 0}
          />
          <Dato
            etiqueta="En playa"
            valor={
              <span
                className={vehiculo?.en_playa ? "text-green-700" : "text-red-700"}
              >
                {vehiculo?.en_playa ? "Sí" : "No"}
              </span>
            }
          />
          <Dato
            etiqueta="Último acarreo"
            valor={
              vehiculo?.ultimo_acarreo
                ? `${formatDateFullWithHs(vehiculo.ultimo_acarreo)} (${vehiculo.ultimo_acarreo_estado})`
                : "Sin acarreos"
            }
          />
        </div>

        <div className="flex flex-col gap-2 mt-6">
          <h3 className="text-sm font-bold uppercase">
            {`Acarreos (${acarreos.length})`}
          </h3>

          {loading && (
            <p className="text-xs text-cerulean-700">Cargando acarreos...</p>
          )}

          {!loading && error && (
            <p className="text-xs text-red-900">{error}</p>
          )}

          {!loading && !error && acarreos.length === 0 && (
            <p className="text-xs text-cerulean-700">
              Este vehículo no tiene acarreos registrados.
            </p>
          )}

          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
            {acarreos.map((acarreo) => (
              <div
                key={acarreo.id}
                className="rounded-lg bg-cerulean-50 border border-cerulean-200 p-3 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>{formatDateFullWithHs(acarreo.fecha_acarreo)}</span>
                  <span className="bg-cerulean-200 text-white px-2 py-0.5 rounded">
                    {acarreo.estado}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Dato etiqueta="Dirección" valor={acarreo.direccion} />
                  <Dato etiqueta="Motivo" valor={acarreo.motivo} />
                  <Dato
                    etiqueta="N° de acta"
                    valor={acarreo.numero_acta ?? "Sin acta"}
                  />
                  <Dato
                    etiqueta="Ingreso a playa"
                    valor={
                      acarreo.fecha_ingreso
                        ? formatDateFullWithHs(acarreo.fecha_ingreso)
                        : "No registrado"
                    }
                  />
                  <Dato
                    etiqueta="Egreso de playa"
                    valor={
                      acarreo.fecha_egreso
                        ? formatDateFullWithHs(acarreo.fecha_egreso)
                        : "No registrado"
                    }
                  />
                  <Dato
                    etiqueta="Grúa"
                    valor={
                      acarreo.Turno_Grua?.Grua?.patente
                        ? `${acarreo.Turno_Grua.Grua.patente} - ${
                            acarreo.Turno_Grua.Grua.Sucursal?.nombre ?? "-"
                          }`
                        : "-"
                    }
                  />
                  <Dato
                    etiqueta="Turno de grúa"
                    valor={
                      acarreo.Turno_Grua
                        ? `${getTurnoLabel(acarreo.Turno_Grua.turno)} - ${formatDateFullWithHs(
                            acarreo.Turno_Grua.fecha_inicio,
                          )}`
                        : "-"
                    }
                  />
                  <Dato
                    etiqueta="Denuncia / Siniestro"
                    valor={`${acarreo.fue_denuncia ? "Sí" : "No"} / ${
                      acarreo.tuvo_siniestro ? "Sí" : "No"
                    }`}
                  />
                </div>
                <Dato
                  etiqueta="Observaciones"
                  valor={acarreo.observaciones ?? "Ninguna"}
                />
                <Dato
                  etiqueta="Incidencias"
                  valor={acarreo.incidencias ?? "Ninguna"}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <CallToActionButton type="button" handleSubmit={onClose}>
            Cerrar
          </CallToActionButton>
        </div>
      </div>
    </Modal>
  );
}
