import Modal from "@mui/material/Modal";
import TextInput from "../../../components/ui/TextInput";
import type { Sucursal } from "../../../types/Sucursal";
import type { Caja } from "../../../types/Caja";
import type { Barrera } from "../../../types/Barrera";
import type { Grua } from "../../../types/Grua";
import { useState } from "react";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import Divider from "@mui/material/Divider";

type Props = {
  open: boolean;
  onClose: () => void;
};

export type SucursalForm = Omit<Sucursal, "id"> & {
  cajas: Omit<Caja, "id" | "Sucursal">[];
  barreras: Omit<Barrera, "id" | "Sucursal">[];
  gruas: Omit<Grua, "id" | "Sucursal">[];
};

const initialFormData: SucursalForm = {
  nombre: "",
  direccion: "",
  cajas: [
    {
      numero_caja: 1,
      referencia: "",
      referencia_pago: "",
    },
  ],
  barreras: [],
  gruas: [],
};
export default function NuevaSucursalModal({ open, onClose }: Props) {
  const [formData, setFormData] = useState<SucursalForm>(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
      }}
      sx={{ padding: 4 }}
    >
      <div className="absolute top-1/2 md:top-1/3 left-1/2 w-full max-w-4/5 md:max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans">
        <h2 className="text-center font-bold uppercase">Crear Sucursal</h2>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
          // onSubmit={handleSubmit}
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
            <label htmlFor="direccion" className="text-xs font-semibold">
              Dirección
            </label>
            <TextInput
              placeholder="Dirección"
              name="direccion"
              type="text"
              onChange={handleChange}
              value={formData.direccion}
            />
          </div>

          {formData.cajas.map((caja, index) => (
            <>
              <Divider className="col-span-2" />
              <h3 className="font-bold uppercase col-span-2">
                Caja {index + 1}
              </h3>
              <div key={index} className="flex flex-col gap-1">
                <label htmlFor="direccion" className="text-xs font-semibold">
                  Numero de caja
                </label>
                <TextInput
                  placeholder="Numero de caja"
                  name="numero_caja"
                  type="number"
                  disabled
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const { name, value } = e.target;
                    setFormData((prev: SucursalForm) => ({
                      ...prev,
                      cajas: prev.cajas.map((caja, i) => {
                        if (i === index) {
                          return {
                            ...caja,
                            [name]: value,
                          };
                        }
                        return caja;
                      }),
                    }));
                  }}
                  value={caja.numero_caja}
                />
              </div>
              <div key={index} className="flex flex-col gap-1">
                <label htmlFor="referencia" className="text-xs font-semibold">
                  Referencia
                </label>
                <TextInput
                  placeholder="Referencia"
                  name="referencia"
                  type="text"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const { name, value } = e.target;
                    setFormData((prev: SucursalForm) => ({
                      ...prev,
                      cajas: prev.cajas.map((caja, i) => {
                        if (i === index) {
                          return {
                            ...caja,
                            [name]: value,
                          };
                        }
                        return caja;
                      }),
                    }));
                  }}
                  value={caja.referencia}
                />
              </div>
              <div key={index} className="flex flex-row gap-1 col-span-2">
                <div key={index} className="flex flex-col w-1/2 gap-1">
                  <label
                    htmlFor="referencia_pago"
                    className="text-xs font-semibold"
                  >
                    Referencia de Pago
                  </label>
                  <TextInput
                    placeholder="Referencia de Pago"
                    name="referencia_pago"
                    type="text"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const { name, value } = e.target;
                      setFormData((prev: SucursalForm) => ({
                        ...prev,
                        cajas: prev.cajas.map((caja, i) => {
                          if (i === index) {
                            return {
                              ...caja,
                              [name]: value,
                            };
                          }
                          return caja;
                        }),
                      }));
                    }}
                    value={caja.referencia_pago}
                  />
                </div>
              </div>
            </>
          ))}
          <div className="flex flex-col items-end col-span-2 gap-1">
            <CallToActionButton
              type="button"
              handleSubmit={() => {
                setFormData((prev: SucursalForm) => ({
                  ...prev,
                  cajas: [
                    ...prev.cajas,
                    {
                      numero_caja: prev.cajas.length + 1,
                      referencia: "",
                      referencia_pago: "",
                    },
                  ],
                }));
              }}
            >
              Agregar Caja
            </CallToActionButton>
          </div>
        </form>
      </div>
    </Modal>
  );
}
