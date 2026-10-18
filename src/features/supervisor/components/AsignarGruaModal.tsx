import { Modal } from "@mui/material";
import type { Grua, Turno_Grua } from "../../../types/Grua";
import type { Usuario } from "../../../types/Usuario";
import { useEffect, useMemo, useState } from "react";
import SelectInput from "../../../components/ui/SelectInput";
import TextInput from "../../../components/ui/TextInput";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import TextArea from "../../../components/ui/TextArea";
import { obtenerGrueros } from "../../usuarios/services/usuariosService";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { getTurnoLabel } from "../../../app/constants/turnos";
import { asignarGrua } from "../../gruas/services/gruasServices";
import { showSuccess } from "../../../app/store/snackbarSlice";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  grua: Grua | null;
  onSuccess?: () => void;
};

export default function AsignarGruaModal({
  open,
  setOpen,
  grua,
  onSuccess,
}: Props) {
  const initialState: Turno_Grua = {
    id_enganchador: "",
    id_chofer: "",
    Grua: grua,
    turno: "",
    nombre_agente: "",
    numero_agente: "",
    observaciones: "",
  };
  const { token } = useSelector((state: RootState) => state.auth);
  const usuario = useSelector((state: RootState) => state.auth.usuario);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [formData, setFormData] = useState(initialState);
  const [fetching, setFetching] = useState(false);
  const dispatch = useDispatch();

  const [error, setError] = useState<string | null>(null);

  // Turno que define el grupo prioritario: el seleccionado en el modal, o por
  // defecto el turno del supervisor si todavía no se eligió ninguno.
  const prioridadTurno = formData.turno || String(usuario?.numero_turno ?? "");

  // Opciones de grueros agrupadas: primero los del turno prioritario (y dentro
  // de ellos, los de la sucursal de la grúa), y después el resto. Se mantiene
  // la agrupación por Sucursal dentro de cada bloque.
  const opcionesGrueros = useMemo(() => {
    const esDeLaSucursalDeLaGrua = (u: Usuario) =>
      !!grua?.Sucursal?.id && u.Sucursal?.id === grua.Sucursal.id;

    const porSucursalYLegajo = (a: Usuario, b: Usuario) => {
      const sa = a.Sucursal?.nombre ?? "Sin Sucursal";
      const sb = b.Sucursal?.nombre ?? "Sin Sucursal";
      if (sa !== sb) return sa.localeCompare(sb);
      return String(a.legajo).localeCompare(String(b.legajo));
    };

    const prioritarios = usuariosFiltrados
      .filter((u) => String(u.numero_turno) === prioridadTurno)
      .sort((a, b) => {
        // La sucursal de la grúa primero; después el resto por sucursal.
        if (esDeLaSucursalDeLaGrua(a) !== esDeLaSucursalDeLaGrua(b)) {
          return esDeLaSucursalDeLaGrua(a) ? -1 : 1;
        }
        return porSucursalYLegajo(a, b);
      });

    const otros = usuariosFiltrados
      .filter((u) => String(u.numero_turno) !== prioridadTurno)
      .sort(porSucursalYLegajo);

    const etiquetaTurno = prioridadTurno
      ? getTurnoLabel(prioridadTurno)
      : "este turno";

    const aOpcion = (u: Usuario, bloque: "prioritario" | "otro") => ({
      value: u.id,
      label: `${u.nombre} ${u.apellido}`,
      group:
        bloque === "prioritario"
          ? `${etiquetaTurno} — ${u.Sucursal?.nombre || "Sin Sucursal"}`
          : `Otros turnos — ${u.Sucursal?.nombre || "Sin Sucursal"}`,
    });

    return [
      ...prioritarios.map((u) => aOpcion(u, "prioritario")),
      ...otros.map((u) => aOpcion(u, "otro")),
    ];
  }, [usuariosFiltrados, prioridadTurno, grua]);

  const handleClose = () => {
    setOpen(false);
    setFormData(initialState);
  };

  useEffect(() => {
    if (!token) return;
    const getUsuarios = async () => {
      try {
        const res = await obtenerGrueros(token!);

        setUsuariosFiltrados(
          res.data.filter(
            (u: Usuario) =>
              !u.bloqueado &&
              !u.turno_grua_chofer_activo &&
              !u.turno_grua_enganchador_activo,
          ),
        );
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };
    getUsuarios();
  }, [token]);

  const validateForm = () => {
    const { id_enganchador, id_chofer, turno, nombre_agente, numero_agente } =
      formData;
    return (
      id_enganchador !== "" &&
      id_chofer !== "" &&
      turno !== "" &&
      nombre_agente !== "" &&
      numero_agente !== ""
    );
  };
  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("Por favor, complete todos los campos requeridos.");
      return;
    }
    setFetching(true);
    setError(null);

    try {
      await asignarGrua(token!, formData);

      dispatch(showSuccess("Grua asignada con exito"));
      onSuccess!();
      handleClose();
    } catch (error) {
      console.error("Error al enviar los datos del formulario:", error);
      setError("Ocurrió un error al enviar los datos. Intente nuevamente.");
    } finally {
      setFetching(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} sx={{ padding: 4 }}>
      <div className="absolute top-1/2 md:top-1/3 left-1/2  max-w-4/5 md:max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-12 shadow-lg font-sans">
        <h2 className="text-center text-xl font-bold mb-2">
          Asignar personal a grúa
        </h2>
        <p className="text-center text-gray-600 mb-4">{`Patente: ${grua?.patente} - Número: ${grua?.numero}`}</p>
        <div className="flex flex-col justify-center gap-2 pt-4 min-w-lg">
          <div className="flex ">
            <SelectInput
              value={formData.turno}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  turno: e.target.value as "" | "1" | "2" | "3",
                })
              }
              options={[
                { value: "1", label: "Mañana" },
                { value: "2", label: "Tarde" },
                { value: "3", label: "Noche" },
              ]}
              placeholder="Seleccionar turno"
              name="turno"
              disabled={fetching}
            />
          </div>
          <div className="flex gap-1">
            <SelectInput
              value={formData.id_chofer}
              onChange={(e) =>
                setFormData({ ...formData, id_chofer: e.target.value })
              }
              options={opcionesGrueros}
              placeholder="Seleccionar chofer"
              name="id_chofer"
              disabled={fetching}
            />
            <div className="flex flex-col gap-2"></div>
            <SelectInput
              value={formData.id_enganchador}
              onChange={(e) =>
                setFormData({ ...formData, id_enganchador: e.target.value })
              }
              options={opcionesGrueros}
              placeholder="Seleccionar enganchador"
              name="id_enganchador"
              disabled={fetching}
            />
          </div>
          <div className="flex gap-1">
            <TextInput
              value={formData.nombre_agente}
              onChange={(e) =>
                setFormData({ ...formData, nombre_agente: e.target.value })
              }
              placeholder="Nombre del agente"
              name="nombre_agente"
              type="text"
              disabled={fetching}
            />
            <TextInput
              value={formData.numero_agente}
              onChange={(e) =>
                setFormData({ ...formData, numero_agente: e.target.value })
              }
              placeholder="Número del agente"
              name="numero_agente"
              type="number"
              disabled={fetching}
            />
          </div>
          <div className="flex gap-1">
            <TextArea
              value={formData.observaciones}
              onChange={(e) =>
                setFormData({ ...formData, observaciones: e.target.value })
              }
              placeholder="Observaciones"
              name="observaciones"
              disabled={fetching}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex w-full gap-2 justify-end mt-4">
            <CallToActionButton
              type="button"
              handleSubmit={handleClose}
              disabled={fetching}
            >
              Cancelar
            </CallToActionButton>
            <CallToActionButton
              type="button"
              disabled={fetching}
              handleSubmit={() => handleSubmit()}
            >
              Confirmar
            </CallToActionButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}
