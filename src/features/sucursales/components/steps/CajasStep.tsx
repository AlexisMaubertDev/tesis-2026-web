import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { IconButton } from "@mui/material";

import { type NuevaSucursalForm } from "../../types/sucursalForm";
import CallToActionButton from "../../../../components/ui/CallToActionButton";
import TextInput from "../../../../components/ui/TextInput";

interface Props {
  form: NuevaSucursalForm;
  setForm: React.Dispatch<React.SetStateAction<NuevaSucursalForm>>;
  next: () => void;
  back: () => void;
}

export default function CajasStep({ form, setForm, next, back }: Props) {
  const addCaja = () => {
    setForm((prev) => ({
      ...prev,
      cajas: [
        ...prev.cajas,
        {
          numero_caja: 0,
          referencia: "",
          referencia_pago: "",
        },
      ],
    }));
  };

  const updateCaja = (numero_caja: number, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      cajas: prev.cajas.map((c) =>
        c.numero_caja === numero_caja ? { ...c, [field]: value } : c,
      ),
    }));
  };

  const removeCaja = (numero_caja: number) => {
    setForm((prev) => ({
      ...prev,
      cajas: prev.cajas.filter((c) => c.numero_caja !== numero_caja),
    }));
  };

  return (
    <>
      <div className="flex justify-end mb-2">
        <CallToActionButton
          type="button"
          // disabled={form.cajas.length === 0}
          handleSubmit={addCaja}
        >
          <span className="flex items-center gap-2 text-xs">
            <AddIcon fontSize="small" />
            Agregar Caja
          </span>
        </CallToActionButton>
      </div>

      {form.cajas.length > 0 ? (
        <table className="w-full table border-collapse text-xs">
          <thead className="bg-cerulean-600 text-white text-left">
            <tr className="text-sm border-b border-cerulean-400">
              <th className="border-r px-2 py-2 ">N° Caja</th>
              <th className="border-r px-2 py-2 border-cerulean-400">
                Referencia
              </th>
              <th className="border-r px-2 py-2 border-cerulean-400">
                Referencia Pago
              </th>
              <th className="px-2 py-2 border-cerulean-400">Acciones</th>
            </tr>
          </thead>

          <tbody className="bg-cerulean-50 text-xs">
            {form.cajas.map((caja, index) => {
              caja.numero_caja = index + 1;
              return (
                <tr key={index}>
                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    <TextInput
                      placeholder="N° Caja"
                      name="caja"
                      type="text"
                      value={caja.numero_caja}
                      disabled
                      onChange={() => {}}
                    />
                  </td>

                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    <TextInput
                      placeholder="Referencia"
                      type="text"
                      name="referencia"
                      value={caja.referencia}
                      onChange={(e) =>
                        updateCaja(
                          caja.numero_caja,
                          "referencia",
                          e.target.value,
                        )
                      }
                    />
                  </td>

                  <td className="border-r border-b border-cerulean-200 px-2 py-2">
                    <TextInput
                      placeholder="Referencia Pago"
                      type="text"
                      name="referencia_pago"
                      value={caja.referencia_pago}
                      onChange={(e) =>
                        updateCaja(
                          caja.numero_caja,
                          "referencia_pago",
                          e.target.value,
                        )
                      }
                    />
                  </td>

                  <td className="border-b border-cerulean-200 px-2 py-2">
                    <IconButton onClick={() => removeCaja(caja.numero_caja)}>
                      <DeleteIcon />
                    </IconButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="text-center">No hay cajas</p>
      )}

      <div className="flex justify-between mt-6">
        <CallToActionButton type="button" handleSubmit={back}>
          Volver
        </CallToActionButton>

        <CallToActionButton
          type="button"
          handleSubmit={next}
          disabled={
            form.cajas.length === 0 ||
            form.cajas.some((c) => !c.referencia || !c.referencia_pago)
          }
        >
          Siguiente
        </CallToActionButton>
      </div>
    </>
  );
}
