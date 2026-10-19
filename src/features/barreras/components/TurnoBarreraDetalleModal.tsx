import { Modal } from "@mui/material";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import DetailItem from "../../../components/ui/DetailItem";
import type { TurnoBarreraDetalle } from "../../../types/TurnoBarrera";

type Props = {
  open: boolean;
  onClose: () => void;
  detalle: TurnoBarreraDetalle | null;
};

/**
 * Detalle de un turno de barrera: la barrera, los playeros que estuvieron
 * asignados, las fechas, el resumen de ingresos/egresos y los acarreos que
 * ingresaron a la playa durante el turno.
 */
export default function TurnoBarreraDetalleModal({
  open,
  onClose,
  detalle,
}: Props) {
  const turno = detalle?.turno ?? null;
  const acarreos = detalle?.acarreos ?? [];
  const totales = detalle?.totales;

  const playeros =
    turno?.usuarios_asignados
      ?.map((ua) => ua.Usuario)
      .filter((u): u is NonNullable<typeof u> => !!u) ?? [];

  return (
    <Modal open={open} onClose={onClose} sx={{ padding: 4 }}>
      <div className="absolute top-1/2 left-1/2 w-4/5 md:max-w-4xl max-h-[95vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans flex flex-col gap-4">
        <h2 className="text-center text-xl font-bold">
          Detalle del turno de barrera
        </h2>

        {turno && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold uppercase">Turno</h3>
            <DetailItem
              etiqueta="Barrera"
              valor={turno.Barrera?.ubicacion ?? "-"}
            />
            <DetailItem
              etiqueta="Sucursal"
              valor={turno.Barrera?.Sucursal?.nombre ?? "-"}
            />
            <DetailItem etiqueta="Turno" valor={turno.turno || "-"} />
            <DetailItem
              etiqueta="Inicio"
              valor={formatDateFullWithHs(turno.fecha_inicio)}
            />
            <DetailItem
              etiqueta="Fin"
              valor={
                turno.fecha_fin
                  ? formatDateFullWithHs(turno.fecha_fin)
                  : "En curso"
              }
            />
            <DetailItem
              etiqueta="Estado"
              valor={turno.activo ? "Abierto" : "Cerrado"}
            />
            <DetailItem
              etiqueta="Playeros"
              valor={
                playeros.length
                  ? playeros
                      .map(
                        (p) =>
                          `${p.nombre} ${p.apellido} (Legajo ${p.legajo})`,
                      )
                      .join(", ")
                  : "Ninguno"
              }
            />
            <DetailItem
              etiqueta="Observaciones"
              valor={turno.observaciones ?? "-"}
            />
            <DetailItem
              etiqueta="Incidencias"
              valor={turno.incidencias ?? "-"}
            />
          </div>
        )}

        {totales && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold uppercase">Resumen del turno</h3>
            <DetailItem
              etiqueta="Ingresos a playa"
              valor={String(totales.ingresos)}
            />
            <DetailItem
              etiqueta="Egresos en el turno"
              valor={String(totales.egresos)}
            />
            <DetailItem
              etiqueta="Estado actual"
              valor={`Ingresados: ${totales.porEstado.ingresados} · Cobrados: ${totales.porEstado.cobrados} · Egresados: ${totales.porEstado.egresados} · Sin cargo: ${totales.porEstado.sinCargo}`}
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold uppercase">
            Acarreos del turno {acarreos.length ? `(${acarreos.length})` : ""}
          </h3>

          {acarreos.length === 0 && (
            <p className="text-xs text-cerulean-800">
              No hay acarreos ingresados en este turno.
            </p>
          )}

          {acarreos.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full table border-collapse text-xs">
                <thead className="bg-cerulean-600 text-white text-left">
                  <tr className="border-b border-cerulean-400">
                    <th className="border-r px-2 py-1 border-cerulean-400">
                      Patente
                    </th>
                    <th className="border-r px-2 py-1 border-cerulean-400">
                      Vehículo
                    </th>
                    <th className="border-r px-2 py-1 border-cerulean-400">
                      Ingreso
                    </th>
                    <th className="border-r px-2 py-1 border-cerulean-400">
                      Egreso
                    </th>
                    <th className="px-2 py-1 border-cerulean-400">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-cerulean-50">
                  {acarreos.map((acarreo) => {
                    const vehiculo = acarreo.Vehiculo;
                    return (
                      <tr key={acarreo.id}>
                        <td className="border-r border-b border-cerulean-200 px-2 py-1 font-bold">
                          {vehiculo?.patente ?? "-"}
                        </td>
                        <td className="border-r border-b border-cerulean-200 px-2 py-1">
                          {[vehiculo?.marca, vehiculo?.modelo, vehiculo?.color]
                            .filter(Boolean)
                            .join(" - ") || "-"}
                        </td>
                        <td className="border-r border-b border-cerulean-200 px-2 py-1">
                          {acarreo.fecha_ingreso
                            ? formatDateFullWithHs(acarreo.fecha_ingreso)
                            : "-"}
                        </td>
                        <td className="border-r border-b border-cerulean-200 px-2 py-1">
                          {acarreo.fecha_egreso
                            ? formatDateFullWithHs(acarreo.fecha_egreso)
                            : "-"}
                        </td>
                        <td className="border-b border-cerulean-200 px-2 py-1">
                          {acarreo.estado}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-4">
          <CallToActionButton type="button" handleSubmit={onClose}>
            Cerrar
          </CallToActionButton>
        </div>
      </div>
    </Modal>
  );
}
