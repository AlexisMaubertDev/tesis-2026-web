import { Modal } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { showSuccess } from "../../../app/store/snackbarSlice";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import SelectInput from "../../../components/ui/SelectInput";
import TextArea from "../../../components/ui/TextArea";
import type { Usuario } from "../../../types/Usuario";
import { obtenerGrueros, obtenerPlayeros } from "../../usuarios/services/usuariosService";
import { editarTurnoGrua } from "../../gruas/services/turnosGruaService";
import { editarTurnoBarrera } from "../../barreras/services/barrerasService";

export type TipoTurnoEditable = "grua" | "barrera";

type Props = {
  open: boolean;
  onClose: () => void;
  tipo: TipoTurnoEditable;
  /** Id del turno a editar. */
  idTurno: string | null;
  /** Texto para identificar el turno (ej: "Grúa N°3 · Turno 1"). */
  descripcion?: string;
  /** Integrantes actuales del turno. */
  choferId?: string;
  enganchadorId?: string;
  /** Playeros asignados (turno de barrera). */
  playerosIds?: string[];
  onSuccess?: () => void;
};

/**
 * Modal para que el supervisor edite un turno de grúa o de barrera:
 * cambia los integrantes y agrega una incidencia OBLIGATORIA que explique
 * qué sucedió para justificar el cambio.
 */
export default function EditarTurnoModal({
  open,
  onClose,
  tipo,
  idTurno,
  descripcion,
  choferId,
  enganchadorId,
  playerosIds,
  onSuccess,
}: Props) {
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [idChofer, setIdChofer] = useState("");
  const [idEnganchador, setIdEnganchador] = useState("");
  const [asignados, setAsignados] = useState<string[]>([]);
  const [incidencia, setIncidencia] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const esGrua = tipo === "grua";

  // Carga los integrantes posibles y los valores actuales del turno.
  useEffect(() => {
    if (!open || !idTurno || !token) return;

    let activo = true;

    const cargar = async () => {
      try {
        const res = esGrua
          ? await obtenerGrueros(token)
          : await obtenerPlayeros(token);
        if (activo) setUsuarios(res.data ?? []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err.response?.data ?? err.message);
      }
    };
    cargar();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIdChofer(choferId ?? "");
    setIdEnganchador(enganchadorId ?? "");
    setAsignados(playerosIds ?? []);
    setIncidencia("");
    setError("");

    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idTurno, token]);

  const handleClose = () => {
    setIncidencia("");
    setError("");
    onClose();
  };

  const toggleAsignado = (id: string) => {
    setAsignados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (!token || !idTurno) return;

    if (incidencia.trim() === "") {
      setError(
        "La incidencia es obligatoria: indicá qué sucedió con el turno.",
      );
      return;
    }

    if (esGrua && (!idChofer || !idEnganchador)) {
      setError("Elegí el chofer y el enganchador.");
      return;
    }

    if (!esGrua && asignados.length === 0) {
      setError("Hay que asignar al menos un playero.");
      return;
    }

    setEnviando(true);
    setError("");

    try {
      const res = esGrua
        ? await editarTurnoGrua(token, idTurno, {
            id_chofer: idChofer,
            id_enganchador: idEnganchador,
            incidencias: incidencia.trim(),
          })
        : await editarTurnoBarrera(token, idTurno, {
            usuarios: asignados,
            incidencias: incidencia.trim(),
          });

      dispatch(showSuccess(res.message ?? "Turno editado con éxito"));
      handleClose();
      onSuccess?.();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "No se pudo editar el turno.",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} sx={{ padding: 4 }}>
      <div className="absolute top-1/2 md:top-1/3 left-1/2 w-4/5 max-w-md -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans flex flex-col gap-4">
        <h2 className="text-center text-xl font-bold">
          {esGrua ? "Editar turno de grúa" : "Editar turno de barrera"}
        </h2>

        {descripcion && (
          <p className="text-center text-sm font-semibold text-cerulean-900">
            {descripcion}
          </p>
        )}

        {esGrua ? (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold">Chofer</label>
              <SelectInput
                placeholder="Chofer"
                name="chofer"
                value={idChofer}
                options={usuarios.map((u) => ({
                  value: u.id ?? "",
                  label: `${u.nombre} ${u.apellido}`,
                }))}
                onChange={(e) => setIdChofer(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold">Enganchador</label>
              <SelectInput
                placeholder="Enganchador"
                name="enganchador"
                value={idEnganchador}
                options={usuarios.map((u) => ({
                  value: u.id ?? "",
                  label: `${u.nombre} ${u.apellido}`,
                }))}
                onChange={(e) => setIdEnganchador(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold">Playeros asignados</label>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-cerulean-300 bg-cerulean-50 p-2 flex flex-col gap-1">
              {usuarios.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="accent-cerulean-600"
                    checked={asignados.includes(u.id ?? "")}
                    onChange={() => toggleAsignado(u.id ?? "")}
                  />
                  {u.nombre} {u.apellido}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold">
            Incidencia (obligatoria: explicá qué sucedió)
          </label>
          <TextArea
            value={incidencia}
            onChange={(e) => setIncidencia(e.target.value)}
            placeholder="Ej: el chofer original se fue a las 14 h y lo reemplazó..."
            name="incidencia"
          />
        </div>

        {error && (
          <p className="text-xs text-scarlet-rush-700 text-center">{error}</p>
        )}

        <div className="flex justify-center gap-3">
          <CallToActionButton type="button" handleSubmit={handleClose}>
            Cancelar
          </CallToActionButton>
          <CallToActionButton
            type="button"
            handleSubmit={handleSubmit}
            disabled={enviando}
          >
            {enviando ? "Guardando..." : "Guardar cambios"}
          </CallToActionButton>
        </div>
      </div>
    </Modal>
  );
}
