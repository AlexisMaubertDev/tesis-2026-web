import Modal from "@mui/material/Modal";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import SelectInput from "../../../components/ui/SelectInput";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import { showSuccess } from "../../../app/store/snackbarSlice";
import type { Usuario } from "../../../types/Usuario";
import { editarUsuario } from "../services/usuariosService";

type Props = {
  open: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onSuccess?: () => void;
};

const roles: { value: Usuario["rol"]; label: string }[] = [
  { value: "PLAYERO", label: "Playero" },
  { value: "CAJERO", label: "Cajero" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "SISTEMAS", label: "Sistemas" },
  { value: "GRUERO", label: "Gruero" },
];

export default function CambiarRolModal({
  open,
  onClose,
  usuario,
  onSuccess,
}: Props) {
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [rol, setRol] = useState<Usuario["rol"]>(usuario?.rol ?? "CAJERO");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!usuario) return;

    if (rol === usuario.rol) {
      onClose();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await editarUsuario(token!, usuario.legajo, { rol });

      dispatch(
        showSuccess(
          `Rol de ${usuario.nombre} ${usuario.apellido} actualizado con exito`,
        ),
      );
      onSuccess?.();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Error al cambiar el rol. Intenta nuevamente más tarde.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setError(null);
        onClose();
      }}
      sx={{ padding: 4 }}
    >
      <div className="absolute top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans">
        <h2 className="text-center font-bold uppercase">Cambiar rol</h2>
        <p className="text-center text-sm text-gray-600 mt-2">
          {usuario
            ? `${usuario.nombre} ${usuario.apellido} (legajo ${usuario.legajo})`
            : ""}
        </p>
        <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="rol" className="text-xs font-semibold">
              Rol
            </label>
            <SelectInput
              placeholder="Rol"
              name="rol"
              options={roles}
              value={rol}
              onChange={(e) => setRol(e.target.value as Usuario["rol"])}
            />
          </div>
          {error && <p className="text-xs text-red-900 text-left">{error}</p>}
          <div className="md:mx-auto">
            <CallToActionButton type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </CallToActionButton>
          </div>
        </form>
      </div>
    </Modal>
  );
}
