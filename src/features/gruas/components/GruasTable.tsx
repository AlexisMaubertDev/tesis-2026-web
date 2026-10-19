import { Tooltip } from "@mui/material";
import type { Grua } from "../../../types/Grua";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import { useState } from "react";
import TurnosGruaGruaModal from "./TurnosGruaGruaModal";
import CambiarEstadoGruaModal from "./CambiarEstadoGruaModal";

interface Props {
  gruas: Grua[];
  /** Muestra la acción para cambiar el estado (páginas del supervisor). */
  puedeCambiarEstado?: boolean;
  /** Se llama después de cambiar el estado, para recargar la lista. */
  onRefrescar?: () => void;
}

export default function GruasTable({
  gruas,
  puedeCambiarEstado = false,
  onRefrescar,
}: Props) {
  // Grúa cuyo historial de turnos se está mirando.
  const [gruaTurnos, setGruaTurnos] = useState<Grua | null>(null);
  // Grúa a la que se le está cambiando el estado.
  const [gruaEstado, setGruaEstado] = useState<Grua | null>(null);

  return (
    <>
      <table className="w-full table border-collapse">
        <thead className="bg-cerulean-600 text-white text-left">
          <tr className="text-sm border-b border-cerulean-400">
            <th className="border-r px-2 py-2 ">Número</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Patente</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Modelo</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Estado</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Sucursal</th>
            <th className="px-2 py-2 border-cerulean-400">Acciones</th>
          </tr>
        </thead>

        <tbody className="bg-cerulean-50 text-xs">
          {gruas.map((grua) => (
            <tr key={grua.id}>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {grua.numero}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {grua.patente}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {grua.modelo}
              </td>

              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {grua.estado}
              </td>
              <td className="border-r border-b border-cerulean-200 px-2 py-2">
                {grua.Sucursal.nombre}
              </td>

              <td className="border-b border-cerulean-200 px-2 py-2">
                <div className="flex items-center gap-2">
                  <button
                    className="text-emerald-700 hover:text-emerald-500 transition-colors duration-300 cursor-pointer"
                    //onClick={() => handleEdit(caja)}
                  >
                    <Tooltip title="Editar">
                      <EditIcon />
                    </Tooltip>
                  </button>

                  <button
                    className="text-cerulean-700 hover:text-cerulean-400 transition-colors duration-300 cursor-pointer"
                    onClick={() => setGruaTurnos(grua)}
                  >
                    <Tooltip title="Historial de turnos">
                      <HistoryIcon />
                    </Tooltip>
                  </button>

                  {puedeCambiarEstado && (
                    <button
                      className="text-amber-700 hover:text-amber-500 transition-colors duration-300 cursor-pointer"
                      onClick={() => setGruaEstado(grua)}
                    >
                      <Tooltip title="Cambiar estado">
                        <PublishedWithChangesIcon />
                      </Tooltip>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <TurnosGruaGruaModal
        open={gruaTurnos !== null}
        onClose={() => setGruaTurnos(null)}
        grua={gruaTurnos}
      />

      <CambiarEstadoGruaModal
        key={gruaEstado?.id ?? "sin-grua"}
        open={gruaEstado !== null}
        onClose={() => setGruaEstado(null)}
        grua={gruaEstado}
        onSuccess={onRefrescar}
      />
    </>
  );
}
