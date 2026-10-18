import Modal from "@mui/material/Modal";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { getTurnoLabel } from "../../../app/constants/turnos";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import DetailItem from "../../../components/ui/DetailItem";
import type { Acarreo, AcarreoUsuario } from "../../../types/Acarreo";
import type { Vehiculo } from "../../../types/Vehiculo";
import { obtenerAcarreosPorPatente } from "../services/vehiculosService";

type Props = {
  open: boolean;
  onClose: () => void;
  vehiculo: Vehiculo | null;
};

/** Nombre, apellido y legajo de un usuario asignado (chofer, enganchador...). */
function nombreUsuario(usuario?: AcarreoUsuario | null) {
  if (!usuario) return "-";

  return `${usuario.nombre} ${usuario.apellido} (leg. ${usuario.legajo})`
    .replace(/\s+/g, " ")
    .trim();
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
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <div className="w-full max-w-4/5 md:max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans">
        <h2 className="text-center font-bold uppercase">
          {`Detalle del vehículo ${vehiculo?.patente ?? ""}`}
        </h2>

        <div className="flex flex-col gap-2 mt-4">
          <h3 className="text-sm font-bold uppercase mt-2">Datos</h3>
          <DetailItem etiqueta="Patente" valor={vehiculo?.patente} />
          <DetailItem etiqueta="Marca" valor={vehiculo?.marca} />
          <DetailItem etiqueta="Modelo" valor={vehiculo?.modelo} />
          <DetailItem etiqueta="Color" valor={vehiculo?.color} />
          <DetailItem etiqueta="Sucursal" valor={vehiculo?.Sucursal?.nombre} />
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
        </div>

        <div className="flex flex-col gap-2 mt-6">
          <h3 className="text-sm font-bold uppercase">
            {`Acarreos (${acarreos.length})`}
          </h3>

          {loading && (
            <p className="text-xs text-cerulean-700">Cargando acarreos...</p>
          )}

          {!loading && error && <p className="text-xs text-red-900">{error}</p>}

          {!loading && !error && acarreos.length === 0 && (
            <p className="text-xs text-cerulean-700">
              Este vehículo no tiene acarreos registrados.
            </p>
          )}

          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
            {acarreos.map((acarreo) => {
              const barrera = acarreo.turno_barrera;
              const usuariosBarrera = (barrera?.usuarios_asignados ?? [])
                .map((asignado) => asignado.Usuario)
                .filter((usuario): usuario is AcarreoUsuario => !!usuario)
                .map(nombreUsuario)
                .join(", ");

              return (
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
                    <DetailItem etiqueta="Dirección" valor={acarreo.direccion} />
                    <DetailItem etiqueta="Motivo" valor={acarreo.motivo} />
                    <DetailItem
                      etiqueta="N° de acta"
                      valor={acarreo.numero_acta ?? "Sin acta"}
                    />
                    <DetailItem
                      etiqueta="Ingreso a playa"
                      valor={
                        acarreo.fecha_ingreso
                          ? formatDateFullWithHs(acarreo.fecha_ingreso)
                          : "No registrado"
                      }
                    />
                    <DetailItem
                      etiqueta="Egreso de playa"
                      valor={
                        acarreo.fecha_egreso
                          ? formatDateFullWithHs(acarreo.fecha_egreso)
                          : "No registrado"
                      }
                    />
                    <DetailItem
                      etiqueta="Grúa"
                      valor={
                        acarreo.Turno_Grua?.Grua?.patente
                          ? `${acarreo.Turno_Grua.Grua.patente} - ${
                              acarreo.Turno_Grua.Grua.Sucursal?.nombre ?? "-"
                            }`
                          : "-"
                      }
                    />
                    <DetailItem
                      etiqueta="Turno de grúa"
                      valor={
                        acarreo.Turno_Grua
                          ? `${getTurnoLabel(acarreo.Turno_Grua.turno)} - ${formatDateFullWithHs(
                              acarreo.Turno_Grua.fecha_inicio,
                            )}`
                          : "-"
                      }
                    />
                    <DetailItem
                      etiqueta="Chofer"
                      valor={nombreUsuario(acarreo.Turno_Grua?.chofer)}
                    />
                    <DetailItem
                      etiqueta="Enganchador"
                      valor={nombreUsuario(acarreo.Turno_Grua?.enganchador)}
                    />
                    <DetailItem
                      etiqueta="Supervisor"
                      valor={nombreUsuario(acarreo.Turno_Grua?.supervisor)}
                    />
                    <DetailItem
                      etiqueta="Denuncia / Siniestro"
                      valor={`${acarreo.fue_denuncia ? "Sí" : "No"} / ${
                        acarreo.tuvo_siniestro ? "Sí" : "No"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <DetailItem
                      etiqueta="Barrera"
                      valor={
                        barrera?.Barrera
                          ? `${barrera.Barrera.ubicacion}${
                              barrera.Barrera.Sucursal
                                ? ` - ${barrera.Barrera.Sucursal.nombre}`
                                : ""
                            }`
                          : "Sin barrera registrada"
                      }
                    />
                    <DetailItem
                      etiqueta="Turno de barrera"
                      valor={
                        barrera
                          ? `${getTurnoLabel(barrera.turno)} (${formatDateFullWithHs(
                              barrera.fecha_inicio,
                            )} - ${formatDateFullWithHs(barrera.fecha_fin)})`
                          : "-"
                      }
                    />
                    <div className="md:col-span-2">
                      <DetailItem
                        etiqueta="Usuarios en la barrera"
                        valor={usuariosBarrera}
                      />
                    </div>
                  </div>

                  <DetailItem
                    etiqueta="Observaciones"
                    valor={acarreo.observaciones ?? "Ninguna"}
                  />
                  <DetailItem
                    etiqueta="Incidencias"
                    valor={acarreo.incidencias ?? "Ninguna"}
                  />
                </div>
              );
            })}
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
