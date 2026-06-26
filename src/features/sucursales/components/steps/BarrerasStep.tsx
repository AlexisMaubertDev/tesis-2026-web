import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { IconButton } from "@mui/material";
import type { NuevaSucursalForm } from "../../types/sucursalForm";
import CallToActionButton from "../../../../components/ui/CallToActionButton";
import TextInput from "../../../../components/ui/TextInput";

interface Props {
  form: NuevaSucursalForm;
  setForm: React.Dispatch<React.SetStateAction<NuevaSucursalForm>>;
  next: () => void;
  back: () => void;
}

export default function BarrerasStep({ form, setForm, next, back }: Props) {
  const addBarrera = () => {
    setForm((prev) => ({
      ...prev,
      Barreras: [
        ...prev.Barreras,
        {
          ubicacion: "",
        },
      ],
    }));
  };

  const updateBarrera = (idx: number, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      Barreras: prev.Barreras.map((b, index) =>
        index === idx ? { ...b, [field]: value } : b,
      ),
    }));
  };

  const removeCaja = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      Barreras: prev.Barreras.filter((c, index) => index !== idx),
    }));
  };

  return (
    <>
      <div className="flex justify-end mb-2">
        <CallToActionButton
          type="button"
          // disabled={form.cajas.length === 0}
          handleSubmit={addBarrera}
        >
          <span className="flex items-center gap-2 text-xs">
            <AddIcon fontSize="small" />
            Agregar Barrera
          </span>
        </CallToActionButton>
      </div>
      {form.Barreras.length > 0 ? (
        <table className="w-full table border-collapse text-xs">
          <thead className="bg-cerulean-600 text-white text-left">
            <tr className="text-sm border-b border-cerulean-400">
              <th className="border-r px-2 py-2 ">N°</th>
              <th className="border-r px-2 py-2 ">Ubicacióon</th>

              <th className="px-2 py-2 border-cerulean-400">Acciones</th>
            </tr>
          </thead>

          <tbody className="bg-cerulean-50 text-xs">
            {form.Barreras.map((barrera, index) => {
              return (
                <tr key={index}>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    {index + 1}
                  </td>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    <TextInput
                      placeholder="Ubicación"
                      name="ubicacion"
                      type="text"
                      value={barrera.ubicacion}
                      onChange={(e) => {
                        updateBarrera(index, "ubicacion", e.target.value);
                      }}
                    />
                  </td>

                  <td className="border-b border-cerulean-200 px-2 py-2">
                    <IconButton onClick={() => removeCaja(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="text-center">No hay barreras</p>
      )}

      <div className="flex justify-between mt-6">
        <CallToActionButton type="button" handleSubmit={back}>
          Volver
        </CallToActionButton>

        <CallToActionButton
          type="button"
          handleSubmit={next}
          disabled={
            form.Barreras.length === 0 ||
            form.Barreras.some((b) => b.ubicacion === "")
          }
        >
          Siguiente
        </CallToActionButton>
      </div>
    </>
  );
}
