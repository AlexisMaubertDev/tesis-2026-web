import type { ReactNode } from "react";
import { formatDateFullWithHs, formatTime } from "../../../app/hooks/dataParse";
import DetailItem from "../../../components/ui/DetailItem";
import type { Acarreo, AcarreoUsuario } from "../../../types/Acarreo";

/** Nombre y apellido de un usuario asignado (chofer, enganchador...). */
function nombreUsuario(usuario?: AcarreoUsuario | null) {
  if (!usuario) return "-";

  return `${usuario.nombre} ${usuario.apellido}`.replace(/\s+/g, " ").trim();
}

/** Patente de la grúa y, si lo tiene, su número. */
function datosGrua(acarreo: Acarreo) {
  const grua = acarreo.Turno_Grua?.Grua;

  if (!grua) return "-";

  return `${grua.patente}${grua.numero ? ` (N° ${grua.numero})` : ""}`;
}

/** Texto del ingreso: la barrera por la que entró y la hora (o su ausencia). */
function textoIngreso(acarreo: Acarreo) {
  if (!acarreo.fecha_ingreso) return "El auto está en camino a la playa";

  const barrera = acarreo.turno_barrera?.Barrera?.ubicacion;

  return `Ingresó a la playa${
    barrera ? ` por la barrera "${barrera}"` : ""
  } a las ${formatTime(acarreo.fecha_ingreso)}hs`;
}

/** Texto del egreso: la hora de salida, el aviso de que sigue en playa, o nada. */
function textoEgreso(acarreo: Acarreo) {
  // Si todavía no ingresó, tampoco pudo egresar: el renglón no se muestra (ya
  // lo dice el texto del ingreso).
  if (!acarreo.fecha_ingreso) return null;

  if (!acarreo.fecha_egreso) return "El auto sigue en playa";

  return `Egresó de la playa a las ${formatTime(acarreo.fecha_egreso)}hs`;
}

/** Texto corrido del ingreso o del egreso (no una fila "etiqueta / valor"). */
function Texto({ children }: { children: ReactNode }) {
  return (
    <p className="md:col-span-2 rounded bg-cerulean-50 px-2 py-1 text-xs text-cerulean-900">
      {children}
    </p>
  );
}

/**
 * Detalle de un acarreo: lo comparten el modal "Ver más" y la página de
 * historial, para que las dos pantallas se vean igual.
 *
 * El ingreso y el egreso no se muestran como filas de fecha sino como texto
 * corrido; si todavía no ocurrieron, se avisa el estado del vehículo.
 */
export default function AcarreoDetalleCard({ acarreo }: { acarreo: Acarreo }) {
  const egreso = textoEgreso(acarreo);

  return (
    <div className="rounded-lg bg-cerulean-50 border border-cerulean-200 p-3 flex flex-col gap-2">
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
        <DetailItem etiqueta="Grúa" valor={datosGrua(acarreo)} />
        <DetailItem
          etiqueta="Chofer"
          valor={nombreUsuario(acarreo.Turno_Grua?.chofer)}
        />
        <DetailItem
          etiqueta="Enganchador"
          valor={nombreUsuario(acarreo.Turno_Grua?.enganchador)}
        />
        <DetailItem
          etiqueta="Denuncia"
          valor={acarreo.fue_denuncia ? "Sí" : "No"}
        />
        <DetailItem
          etiqueta="Siniestro"
          valor={acarreo.tuvo_siniestro ? "Sí" : "No"}
        />
        <Texto>{textoIngreso(acarreo)}</Texto>
        {egreso && <Texto>{egreso}</Texto>}
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
}
