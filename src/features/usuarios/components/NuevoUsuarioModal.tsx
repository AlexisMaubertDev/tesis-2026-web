import Modal from "@mui/material/Modal";
import TextInput from "../../../components/ui/TextInput";
import {  useState } from "react";
import { type Usuario } from "../../../types/Usuario.ts";
import Checkbox from "@mui/material/Checkbox";
import { showSuccess } from "../../../app/store/snackbarSlice.ts";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import SelectInput from "../../../components/ui/SelectInput.tsx";
import { crearUsuario } from "../services/usuariosService.ts";
import { verificarCampos } from "../utils/verificarCampos.ts";

type Props = {
  open: boolean;
  onClose: () => void;
  sucursales: { id: string; nombre: string; direccion: string }[];
};

export type UsuarioForm = Usuario & {
  password: string;
};

const initialFormData: UsuarioForm = {
  id: "",
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  password: "",
  rol: "CAJERO",
  legajo: "",
  Sucursal: {
    nombre: "",
    id: "",
    direccion: "",
  },
  numero_turno: 1,
  bloqueado: false,
  trabaja_domingo: false,
};

export default function NuevoUsuarioModal({ open, onClose, sucursales }: Props) {
  const { token } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState<UsuarioForm>(initialFormData);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!verificarCampos(formData, setError)) return;

    setLoading(true);

    try {
      const res = await crearUsuario(token!, formData);
      console.log(res);

      dispatch(showSuccess("Usuario creado con exito"));

      onClose();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError("Error al crear usuario. Intenta nuevamente más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  return (
    <Modal
      open={open}
      onClose={() => {
        setFormData(initialFormData);
        setError(null);
        onClose();
      }}
      sx={{ padding: 4 }}
    >
      <div className="absolute top-1/2 md:top-1/3 left-1/2 w-full max-w-4/5 md:max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans">
        <h2 className="text-center font-bold uppercase">Crear Usuario</h2>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="nombre" className="text-xs font-semibold">
              Nombre
            </label>
            <TextInput
              placeholder="Nombre"
              name="nombre"
              type="text"
              onChange={handleChange}
              value={formData.nombre}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="apellido" className="text-xs font-semibold">
              Apellido
            </label>
            <TextInput
              placeholder="Apellido"
              name="apellido"
              type="text"
              onChange={handleChange}
              value={formData.apellido}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="dni" className="text-xs font-semibold">
              DNI
            </label>
            <TextInput
              placeholder="DNI"
              name="dni"
              type="number"
              onChange={handleChange}
              value={formData.dni}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="legajo" className="text-xs font-semibold">
              Legajo
            </label>
            <TextInput
              placeholder="Legajo"
              name="legajo"
              type="number"
              onChange={handleChange}
              value={formData.legajo}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs font-semibold">
              Email
            </label>
            <TextInput
              placeholder="Email"
              name="email"
              type="email"
              onChange={handleChange}
              value={formData.email}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-xs font-semibold">
              Contraseña
            </label>
            <TextInput
              placeholder="Contraseña"
              name="password"
              type="password"
              onChange={handleChange}
              value={formData.password}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="rol" className="text-xs font-semibold">
              Rol
            </label>
            <SelectInput
              placeholder="Rol"
              name="rol"
              options={[
                { value: "PLAYERO", label: "Playero" },
                { value: "CAJERO", label: "Cajero" },
                { value: "SUPERVISOR", label: "Supervisor" },
                { value: "SISTEMAS", label: "Sistemas" },
              ]}
              value={formData.rol}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({
                  ...formData,
                  rol: e.target.value as Usuario["rol"],
                })
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="Sucursal" className="text-xs font-semibold">
              Sucursal
            </label>
            <SelectInput
              placeholder="Sucursal"
              name="Sucursal"
              options={sucursales.map((sucursal) => ({
                value: sucursal.id,
                label: sucursal.nombre,
              }))}
              value={formData.Sucursal.id}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const selectedSucursal = sucursales.find(
                  (sucursal) => sucursal.id === e.target.value,
                );
                if (selectedSucursal) {
                  setFormData({
                    ...formData,
                    Sucursal: {
                      id: selectedSucursal.id,
                      nombre: selectedSucursal.nombre,
                      direccion: selectedSucursal.direccion,
                    },
                  });
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="numero_turno" className="text-xs font-semibold">
              Turno
            </label>
            <TextInput
              placeholder="Turno"
              name="numero_turno"
              type="number"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  numero_turno: Number(e.target.value),
                })
              }
              value={formData.numero_turno}
            />
          </div>

          <div className="flex gap-1 items-center">
            <label htmlFor="trabaja_domingo" className="text-xs font-semibold">
              Trabaja los domingos?
            </label>
            <Checkbox
              checked={formData.trabaja_domingo}
              sx={{
                // backgroundColor: "#eef4f7",
                "&.Mui-checked": { color: "#e0525b" },
              }}
              slotProps={{
                root: {
                  className:
                    "rounded-lg border-2 border-cerulean-700 p-1 hover:bg-cerulean-200 transition-colors",
                },
              }}
              onChange={(e) =>
                setFormData({ ...formData, trabaja_domingo: e.target.checked })
              }
            />
          </div>
          {error && (
            <div className="flex flex-col md:col-span-2 gap-1">
              <p className="text-xs text-red-900 text-left">{error}</p>
            </div>
          )}
          <div className="flex flex-col md:col-span-2 gap-1 md:mx-auto">
            <CallToActionButton type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Usuario"}
            </CallToActionButton>
          </div>
        </form>
      </div>
    </Modal>
  );
}
