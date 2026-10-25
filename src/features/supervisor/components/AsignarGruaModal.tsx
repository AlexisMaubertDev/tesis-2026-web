import { Modal } from "@mui/material";
import type { Grua, Turno_Grua } from "../../../types/Grua";
import type { Usuario } from "../../../types/Usuario";
import { useEffect, useMemo, useState } from "react";
import SelectInput from "../../../components/ui/SelectInput";
import TextInput from "../../../components/ui/TextInput";
import CallToActionButton from "../../../components/ui/CallToActionButton";
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

  // Opciones de grueros ordenadas:
  // 1) Misma sucursal que la grúa Y mismo turno que prioridadTurno.
  // 2) Misma sucursal que la grúa, pero distinto turno.
  // 3) El resto, ordenados por sucursal y luego por turno.
  const opcionesGrueros = useMemo(() => {
    const esDeLaSucursalDeLaGrua = (u: Usuario) =>
      !!grua?.Sucursal?.id && u.Sucursal?.id === grua.Sucursal.id;

    const sucursalNombre = (u: Usuario) => u.Sucursal?.nombre || "Sin Sucursal";

    const grueros = usuariosFiltrados.filter((u) => u.rol === "GRUERO");

    const tierDe = (u: Usuario): number => {
      const mismoTurno = String(u.numero_turno) === prioridadTurno;
      if (esDeLaSucursalDeLaGrua(u) && mismoTurno) return 0;
      if (esDeLaSucursalDeLaGrua(u)) return 1;
      return 2;
    };

    const ordenados = [...grueros].sort((a, b) => {
      const ta = tierDe(a);
      const tb = tierDe(b);
      if (ta !== tb) return ta - tb;

      // Tier 1: ordenar por turno.
      if (ta === 1) {
        if (a.numero_turno !== b.numero_turno)
          return a.numero_turno - b.numero_turno;
      }

      // Tier 2: ordenar por sucursal, luego por turno.
      if (ta === 2) {
        const sa = sucursalNombre(a);
        const sb = sucursalNombre(b);
        if (sa !== sb) return sa.localeCompare(sb);
        if (a.numero_turno !== b.numero_turno)
          return a.numero_turno - b.numero_turno;
      }

      return String(a.legajo).localeCompare(String(b.legajo));
    });

    const grupoDe = (u: Usuario): string => {
      const t = tierDe(u);
      const turnoLbl = getTurnoLabel(String(u.numero_turno));
      const suc = sucursalNombre(u);

      if (t === 0) {
        return `${prioridadTurno ? getTurnoLabel(prioridadTurno) : "Este turno"} — ${
          grua?.Sucursal?.nombre || "Sucursal de la grúa"
        }`;
      }
      if (t === 1) {
        return `${turnoLbl} — ${grua?.Sucursal?.nombre || "Sucursal de la grúa"}`;
      }
      return `${suc} — ${turnoLbl}`;
    };

    return ordenados.map((u) => ({
      value: u.id,
      label: `${u.nombre} ${u.apellido}`,
      group: grupoDe(u),
    }));
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
