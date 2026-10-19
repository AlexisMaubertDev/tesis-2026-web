import { Modal } from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import DetailItem from "../../../components/ui/DetailItem";
import type { TurnoBarreraDetalle } from "../../../types/TurnoBarrera";
import AgregarIncidenciaAcarreoModal from "../../vehiculos/components/AgregarIncidenciaAcarreoModal";

type Props = {
  open: boolean;
  onClose: () => void;
  detalle: TurnoBarreraDetalle | null;
  /** Vuelve a pedir el detalle del turno (ej: tras agregar una incidencia). */
  onRefrescar?: () => void;
};

/**
 * Detalle de un turno de barrera: la barrera, los playeros que estuvieron
 * asignados, las fechas, el resumen y la lista de entradas y salidas de
 * vehículos por la barrera durante el turno.
 */
export default function TurnoBarreraDetalleModal({
  open,
  onClose,
  detalle,
  onRefrescar,
}: Props) {
  const { usuario } = useSelector((state: RootState) => state.auth);

  // Las incidencias sobre un acarreo sólo las puede agregar un supervisor.
  const puedeAgregarIncidencia =
    usuario?.rol === "SUPERVISOR" || usuario?.rol === "SISTEMAS";

  const [acarreoIncidencia, setAcarreoIncidencia] = useState<{
    id: string;
    patente?: string | null;
    incidencias?: string | null;
    titulo: string;
  } | null>(null);

  const turno = detalle?.turno ?? null;
  const movimientos = detalle?.movimientos ?? [];
  const totales = detalle?.totales;

  const playeros =
    turno?.usuarios_asignados
      ?.map((ua) => ua.Usuario)
      .filter((u): u is NonNullable<typeof u> => !!u) ?? [];

  return (
    <>
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
                        .map((p) => `${p.nombre} ${p.apellido}`)
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
                etiqueta="Autos en playa"
                valor={String(totales.enPlaya)}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold uppercase">
              Movimientos del turno{" "}
              {movimientos.length ? `(${movimientos.length})` : ""}
            </h3>

            {movimientos.length === 0 && (
              <p className="text-xs text-cerulean-800">
                No hay entradas ni salidas en este turno.
              </p>
            )}

            {movimientos.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full table border-collapse text-xs">
                  <thead className="bg-cerulean-600 text-white text-left">
                    <tr className="border-b border-cerulean-400">
                      <th className="border-r px-2 py-1 border-cerulean-400">
                        Movimiento
                      </th>
                      <th className="border-r px-2 py-1 border-cerulean-400">
                        Vehículo
                      </th>
                      <th className="border-r px-2 py-1 border-cerulean-400">
                        Fecha
                      </th>
                      <th className="px-2 py-1 border-cerulean-400">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-cerulean-50">
                    {movimientos.map((movimiento) => {
                      const vehiculo = movimiento.acarreo.Vehiculo;
                      const patente = vehiculo?.patente ?? "-";
                      const esEntrada = movimiento.tipo === "ENTRADA";
                      const titulo = esEntrada
                        ? "Incidencias entrada"
                        : "Incidencias salida";

                      return (
                        <tr key={movimiento.id}>
                          <td className="border-r border-b border-cerulean-200 px-2 py-1 font-bold">
                            {esEntrada ? "Entrada" : "Salida"} {patente}
                          </td>
                          <td className="border-r border-b border-cerulean-200 px-2 py-1">
                            {[vehiculo?.marca, vehiculo?.modelo, vehiculo?.color]
                              .filter(Boolean)
                              .join(" - ") || "-"}
                          </td>
                          <td className="border-r border-b border-cerulean-200 px-2 py-1">
                            {formatDateFullWithHs(movimiento.fecha)}
                          </td>
                          <td className="border-b border-cerulean-200 px-2 py-1">
                            {puedeAgregarIncidencia ? (
                              <CallToActionButton
                                type="button"
                                handleSubmit={() =>
                                  setAcarreoIncidencia({
                                    id: movimiento.acarreo.id,
                                    patente,
                                    incidencias:
                                      movimiento.acarreo.incidencias,
                                    titulo,
                                  })
                                }
                              >
                                {movimiento.acarreo.incidencias
                                  ? "Ver incidencias"
                                  : "Agregar incidencia"}
                              </CallToActionButton>
                            ) : (
                              "-"
                            )}
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

      <AgregarIncidenciaAcarreoModal
        open={acarreoIncidencia !== null}
        onClose={() => setAcarreoIncidencia(null)}
        acarreo={acarreoIncidencia}
        titulo={acarreoIncidencia?.titulo ?? "Incidencia acarreo"}
        incidenciasExistentes={acarreoIncidencia?.incidencias}
        onSuccess={onRefrescar}
      />
    </>
  );
}
