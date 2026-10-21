import { Modal } from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import DetailItem from "../../../components/ui/DetailItem";
import type { TurnoGruaDetalle } from "../../../types/TurnoGrua";
import AgregarIncidenciaAcarreoModal from "../../vehiculos/components/AgregarIncidenciaAcarreoModal";
import AgregarIncidenciaTurnoModal from "../../turnos/components/AgregarIncidenciaTurnoModal";

type Props = {
  open: boolean;
  onClose: () => void;
  detalle: TurnoGruaDetalle | null;
  /** Vuelve a pedir el detalle del turno (ej: tras agregar una incidencia). */
  onRefrescar?: () => void;
};

const nombreUsuario = (
  usuario: { nombre: string; apellido: string } | null | undefined,
) => (usuario ? `${usuario.nombre} ${usuario.apellido}` : "-");

/**
 * Detalle de un turno de grúa: la grúa, los usuarios que participaron, las
 * fechas, el resumen y los acarreos que se hicieron en el turno (con el
 * vehículo de cada uno).
 */
export default function TurnoGruaDetalleModal({
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
  } | null>(null);

  // Si se está agregando/mirando la incidencia del turno.
  const [turnoIncidencia, setTurnoIncidencia] = useState(false);

  const turno = detalle?.turno ?? null;
  const acarreos = detalle?.acarreos ?? [];
  const totales = detalle?.totales;

  return (
    <>
      <Modal open={open} onClose={onClose} sx={{ padding: 4 }}>
        <div className="absolute top-1/2 left-1/2 w-4/5 md:max-w-4xl max-h-[95vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans flex flex-col gap-4">
          <h2 className="text-center text-xl font-bold">
            Detalle del turno de grúa
          </h2>

          {turno && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold uppercase">Turno</h3>
              <DetailItem etiqueta="Grúa" valor={turno.Grua?.patente ?? "-"} />
              <DetailItem
                etiqueta="Número / modelo"
                valor={
                  turno.Grua
                    ? `${turno.Grua.numero} - ${turno.Grua.modelo}`
                    : "-"
                }
              />
              <DetailItem
                etiqueta="Sucursal"
                valor={turno.Grua?.Sucursal?.nombre ?? "-"}
              />
              <DetailItem etiqueta="Turno" valor={turno.turno || "-"} />
              <DetailItem
                etiqueta="Agente"
                valor={
                  turno.nombre_agente
                    ? `${turno.nombre_agente} (${turno.numero_agente})`
                    : "-"
                }
              />
              <DetailItem
                etiqueta="Chofer"
                valor={nombreUsuario(turno.chofer)}
              />
              <DetailItem
                etiqueta="Enganchador"
                valor={nombreUsuario(turno.enganchador)}
              />
              <DetailItem
                etiqueta="Supervisor"
                valor={nombreUsuario(turno.supervisor)}
              />
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
                etiqueta="Incidencias"
                valor={turno.incidencias ?? "-"}
              />
              {puedeAgregarIncidencia && (
                <div className="flex justify-end">
                  <CallToActionButton
                    type="button"
                    handleSubmit={() => setTurnoIncidencia(true)}
                  >
                    {turno.incidencias
                      ? "Ver incidencias del turno"
                      : "Agregar incidencia al turno"}
                  </CallToActionButton>
                </div>
              )}
            </div>
          )}

          {totales && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold uppercase">Resumen del turno</h3>
              <DetailItem
                etiqueta="Acarreos"
                valor={String(totales.cantidad)}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold uppercase">
              Acarreos {acarreos.length ? `(${acarreos.length})` : ""}
            </h3>

            {acarreos.length === 0 && (
              <p className="text-xs text-cerulean-800">
                No hay acarreos en este turno.
              </p>
            )}

            {acarreos.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full table border-collapse text-xs">
                  <thead className="bg-cerulean-600 text-white text-left">
                    <tr className="border-b border-cerulean-400">
                      <th className="border-r px-2 py-1 border-cerulean-400">
                        Fecha y hora
                      </th>
                      <th className="border-r px-2 py-1 border-cerulean-400">
                        Patente
                      </th>
                      <th className="border-r px-2 py-1 border-cerulean-400">
                        Vehículo
                      </th>
                      <th className="border-r px-2 py-1 border-cerulean-400">
                        Dirección
                      </th>
                      <th className="border-r px-2 py-1 border-cerulean-400">
                        Motivo
                      </th>
                      <th className="px-2 py-1 border-cerulean-400">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-cerulean-50">
                    {acarreos.map((acarreo) => {
                      const vehiculo = acarreo.Vehiculo;
                      return (
                        <tr key={acarreo.id}>
                          <td className="border-r border-b border-cerulean-200 px-2 py-1">
                            {formatDateFullWithHs(acarreo.fecha_acarreo)}
                          </td>
                          <td className="border-r border-b border-cerulean-200 px-2 py-1 font-bold">
                            {vehiculo?.patente ?? "-"}
                          </td>
                          <td className="border-r border-b border-cerulean-200 px-2 py-1">
                            {[vehiculo?.marca, vehiculo?.modelo, vehiculo?.color]
                              .filter(Boolean)
                              .join(" - ") || "-"}
                          </td>
                          <td className="border-r border-b border-cerulean-200 px-2 py-1">
                            {acarreo.direccion ?? "-"}
                          </td>
                          <td className="border-r border-b border-cerulean-200 px-2 py-1">
                            {acarreo.motivo ?? "-"}
                          </td>
                          <td className="border-b border-cerulean-200 px-2 py-1">
                            {puedeAgregarIncidencia ? (
                              <CallToActionButton
                                type="button"
                                handleSubmit={() =>
                                  setAcarreoIncidencia({
                                    id: acarreo.id,
                                    patente: vehiculo?.patente ?? null,
                                    incidencias: acarreo.incidencias,
                                  })
                                }
                              >
                                {acarreo.incidencias
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
        titulo="Incidencia acarreo"
        incidenciasExistentes={acarreoIncidencia?.incidencias}
        onSuccess={onRefrescar}
      />

      <AgregarIncidenciaTurnoModal
        open={turnoIncidencia}
        onClose={() => setTurnoIncidencia(false)}
        tipo="grua"
        turno={turno}
        descripcion={
          turno
            ? `Grúa ${turno.Grua?.patente ?? "-"} · Turno ${turno.turno || "-"}`
            : undefined
        }
        onSuccess={onRefrescar}
      />
    </>
  );
}
