import { type NuevaSucursalForm } from "../../types/sucursalForm";
import TextInput from "../../../../components/ui/TextInput";
import CallToActionButton from "../../../../components/ui/CallToActionButton";

interface Props {
  form: NuevaSucursalForm;
  setForm: React.Dispatch<React.SetStateAction<NuevaSucursalForm>>;
  next: () => void;
}

export default function DatosGeneralesStep({ form, setForm, next }: Props) {
  return (
    <div className="flex flex-col pt-4 gap-4">
      <div className="flex gap-2">
        <TextInput
          value={form.nombre}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              nombre: e.target.value,
            }))
          }
          placeholder="Nombre"
          name="nombre"
          type="text"
        />
        <TextInput
          value={form.direccion}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              direccion: e.target.value,
            }))
          }
          placeholder="Dirección"
          name="direccion"
          type="text"
        />
      </div>

      <div className="flex justify-end">
        <CallToActionButton
          type="button"
          handleSubmit={next}
          disabled={form.direccion === "" || form.nombre === ""}
        >
          Siguiente
        </CallToActionButton>
      </div>
    </div>
  );
}
