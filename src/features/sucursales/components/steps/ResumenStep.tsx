import CallToActionButton from "../../../../components/ui/CallToActionButton";
import { type NuevaSucursalForm } from "../../types/sucursalForm";

interface Props {
  form: NuevaSucursalForm;
  loading: boolean;
  save: () => void;
  back: () => void;
}

export default function ResumenStep({ form, save, back, loading }: Props) {
  return (
    <div className="flex flex-col gap-2 mt-6">
      <h2 className="font-bold">Resumen</h2>
      <div className="flex gap-2">
        <p className="flex-1 bg-cerulean-50 border border-cerulean-200 rounded-lg p-2">
          Cajas: {form.cajas.length}
        </p>

        <p className="flex-1 bg-cerulean-50 border border-cerulean-200 rounded-lg p-2">
          Barreras: {form.barreras.length}
        </p>

        <p className="flex-1 bg-cerulean-50 border border-cerulean-200 rounded-lg p-2">
          Grúas: {form.gruas.length}
        </p>
      </div>

      <div className="flex justify-between mt-6">
        <CallToActionButton
          type="button"
          handleSubmit={back}
          disabled={loading}
        >
          Volver
        </CallToActionButton>
        <CallToActionButton
          type="button"
          handleSubmit={save}
          disabled={loading}
        >
          Guardar Sucursal
        </CallToActionButton>
      </div>
    </div>
  );
}
