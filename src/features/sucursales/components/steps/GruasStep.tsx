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

export default function GruasStep({ form, setForm, next, back }: Props) {
  const addGrua = () => {
    setForm((prev) => ({
      ...prev,
      Gruas: [
        ...prev.Gruas,
        {
          patente: "",
          modelo: "",
          numero: 0,
        },
      ],
    }));
  };

  const updateGrua = (idx: number, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      Gruas: prev.Gruas.map((g, index) =>
        index === idx ? { ...g, [field]: value } : g,
      ),
    }));
  };

  const removeGrua = (patente: string) => {
    setForm((prev) => ({
      ...prev,
      Gruas: prev.Gruas.filter((g) => g.patente !== patente),
    }));
  };

  return (
    <>
      <div className="flex justify-end mb-2">
        <CallToActionButton
          type="button"
          // disabled={form.cajas.length === 0}
          handleSubmit={addGrua}
        >
          <span className="flex items-center gap-2 text-xs">
            <AddIcon fontSize="small" />
            Agregar Grua
          </span>
        </CallToActionButton>
      </div>
      {form.Gruas.length > 0 ? (
        <table className="w-full table border-collapse text-xs">
          <thead className="bg-cerulean-600 text-white text-left">
            <tr className="text-sm border-b border-cerulean-400">
              <th className="border-r px-2 py-2 ">Patente</th>
              <th className="border-r px-2 py-2 ">Número</th>
              <th className="border-r px-2 py-2 ">Modelo</th>
              <th className="px-2 py-2 border-cerulean-400">Acciones</th>
            </tr>
          </thead>

          <tbody className="bg-cerulean-50 text-xs">
            {form.Gruas.map((grua, index) => {
              return (
                <tr key={index}>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    <TextInput
                      placeholder="Patente"
                      name="patente"
                      type="text"
                      value={grua.patente}
                      onChange={(e) => {
                        updateGrua(index, "patente", e.target.value);
                      }}
                    />
                  </td>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    <TextInput
                      placeholder="Número"
                      name="numero"
                      type="text"
                      value={grua.numero}
                      onChange={(e) => {
                        updateGrua(index, "numero", e.target.value);
                      }}
                    />
                  </td>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    <TextInput
                      placeholder="Modelo"
                      name="modelo"
                      type="text"
                      value={grua.modelo}
                      onChange={(e) => {
                        updateGrua(index, "modelo", e.target.value);
                      }}
                    />
                  </td>

                  <td className="border-b border-cerulean-200 px-2 py-2">
                    <IconButton onClick={() => removeGrua(grua.patente)}>
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
            form.Gruas.length === 0 ||
            form.Gruas.some(
              (grua) =>
                grua.patente === "" || grua.numero === 0 || grua.modelo === "",
            )
          }
        >
          Siguiente
        </CallToActionButton>
      </div>
    </>
  );
}
