import { Modal } from "@mui/material";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListSubheader from "@mui/material/ListSubheader";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import type { Barrera } from "../../../types/Barrera";
import type { Usuario } from "../../../types/Usuario";
import { useEffect, useMemo, useState } from "react";
import SelectInput from "../../../components/ui/SelectInput";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import { obtenerPlayeros } from "../../usuarios/services/usuariosService";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { asignarBarrera } from "../../barreras/services/barrerasService";
import { showSuccess } from "../../../app/store/snackbarSlice";
import { getTurnoLabel } from "../../../app/constants/turnos";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  barrera: Barrera | null;
  onSuccess?: () => void;
};

export default function AsignarBarreraModal({
  open,
  setOpen,
  barrera,
  onSuccess,
}: Props) {
  const { token, usuario } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [playeros, setPlayeros] = useState<Usuario[]>([]);
  const [turno, setTurno] = useState<"" | "1" | "2" | "3">("");
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setOpen(false);
    setTurno("");
    setSeleccionados([]);
    setError(null);
  };

  useEffect(() => {
    if (!open || !token) return;
    const cargar = async () => {
      try {
        const res = await obtenerPlayeros(token!);
        setPlayeros(
          (res.data as Usuario[]).filter(
            (u) =>
              !u.bloqueado &&
              !(u.turnos_barrera as { turno_barrera?: { activo?: boolean } }[] | undefined)?.some(
                (tb) => tb?.turno_barrera?.activo,
              ),
          ),
        );
      } catch (e) {
        console.error("Error al obtener playeros:", e);
      }
    };
    cargar();
  }, [open, token]);

  const prioridadTurno = turno || String(usuario?.numero_turno ?? "");

  const opcionesPlayeros = useMemo(() => {
    const porSucursalYLegajo = (a: Usuario, b: Usuario) => {
      const sa = a.Sucursal?.nombre ?? "Sin Sucursal";
      const sb = b.Sucursal?.nombre ?? "Sin Sucursal";
      if (sa !== sb) return sa.localeCompare(sb);
      return String(a.legajo).localeCompare(String(b.legajo));
    };

    const prioritarios = playeros
      .filter((u) => String(u.numero_turno) === prioridadTurno)
      .sort(porSucursalYLegajo);
    const otros = playeros
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
  }, [playeros, prioridadTurno]);

  const validateForm = () => turno !== "" && seleccionados.length > 0;

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("Seleccioná el turno y al menos un playero.");
      return;
    }
    setFetching(true);
    setError(null);
    try {
      await asignarBarrera(token!, {
        id_barrera: barrera!.id,
        turno,
        id_usuarios: seleccionados,
      });
      dispatch(showSuccess("Playeros asignados con éxito"));
      onSuccess?.();
      handleClose();
    } catch (e) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Ocurrió un error. Intenta nuevamente.");
    } finally {
      setFetching(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} sx={{ padding: 4 }}>
      <div className="absolute top-1/2 md:top-1/3 left-1/2 max-w-4/5 md:max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-12 shadow-lg font-sans">
        <h2 className="text-center text-xl font-bold mb-2">
          Asignar playeros a barrera
        </h2>
        <p className="text-center text-gray-600 mb-4">{`Ubicación: ${barrera?.ubicacion}`}</p>
        <div className="flex flex-col justify-center gap-2 pt-4 min-w-lg">
          <div className="flex">
            <SelectInput
              value={turno}
              onChange={(e) =>
                setTurno(e.target.value as "" | "1" | "2" | "3")
              }
              options={[
                { value: "1", label: "Mañana" },
                { value: "2", label: "Tarde" },
                { value: "3", label: "Noche" },
              ]}
              placeholder="Seleccionar turno"
              name="turno"
              disabled={fetching}
            />
          </div>
          <div className="flex flex-col gap-1">
            <FormControl fullWidth size="small">
              <Select
                multiple
                value={seleccionados}
                onChange={(e) =>
                  setSeleccionados(e.target.value as string[])
                }
                input={
                  <OutlinedInput
                    sx={{
                      backgroundColor: "#eef4f7",
                      borderRadius: "0.5rem",
                      fontSize: "0.75rem",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#315968",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#315968",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#5295ad",
                        borderWidth: "2px",
                      },
                      "& .MuiSelect-select": {
                        padding: "8px",
                      },
                    }}
                  />
                }
                renderValue={(selected) =>
                  (selected as string[]).length === 0
                    ? "Seleccionar playeros"
                    : `${(selected as string[]).length} playero(s) seleccionado(s)`
                }
                displayEmpty
                disabled={fetching}
              >
                {(() => {
                  const items: React.ReactNode[] = [];
                  let lastGroup = "";
                  for (const opt of opcionesPlayeros) {
                    if (opt.group !== lastGroup) {
                      items.push(
                        <ListSubheader key={`g-${opt.group}`}>
                          {opt.group}
                        </ListSubheader>,
                      );
                      lastGroup = opt.group || "";
                    }
                    items.push(
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>,
                    );
                  }
                  if (items.length === 0) {
                    items.push(
                      <MenuItem key="empty" disabled value="">
                        Sin playeros disponibles
                      </MenuItem>,
                    );
                  }
                  return items;
                })()}
              </Select>
            </FormControl>
            {seleccionados.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                {seleccionados.map((id) => {
                  const p = playeros.find((u) => u.id === id);
                  return p ? (
                    <Chip
                      key={id}
                      label={`${p.nombre} ${p.apellido}`}
                      size="small"
                    />
                  ) : null;
                })}
              </Box>
            )}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex w-full gap-2 justify-end mt-4">
            <CallToActionButton type="button" handleSubmit={handleClose} disabled={fetching}>
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