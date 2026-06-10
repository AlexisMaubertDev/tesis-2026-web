import { useState } from "react";
import { Step, StepLabel, Stepper, Modal } from "@mui/material";

import DatosGeneralesStep from "./steps/DatosGeneralesStep";
import CajasStep from "./steps/CajasStep";

import BarrerasStep from "./steps/BarrerasStep";
import GruasStep from "./steps/GruasStep";
import ResumenStep from "./steps/ResumenStep";

import {
  type NuevaSucursalForm,
  defaultSucursalForm,
} from "../types/sucursalForm";
import { crearSucursal, editarSucursal } from "../services/sucursalesService";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { showError, showSuccess } from "../../../app/store/snackbarSlice";

interface SucursalModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: NuevaSucursalForm;
}

const steps = ["Datos Generales", "Cajas", "Barreras", "Grúas", "Resumen"];

export default function NuevaSucursalModal({
  open,
  onClose,
  initialData,
}: SucursalModalProps) {
  const { token } = useSelector((state: RootState) => state.auth);
  const [activeStep, setActiveStep] = useState(0);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [form, setForm] = useState<NuevaSucursalForm>(
    initialData ?? defaultSucursalForm,
  );

  const nextStep = () => {
    setActiveStep((prev) => prev + 1);
  };

  const previousStep = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    setForm(initialData ?? defaultSucursalForm);
    onClose();
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (initialData) {
      await editarSucursalExistente();
    } else {
      await crearNuevaSucursal();
    }
    setLoading(false);
    //handleClose();
  };

  const crearNuevaSucursal = async () => {
    try {
      const res = await crearSucursal(token!, form);
      if (res.success) {
        dispatch(showSuccess("Sucursal creada con exito"));
      } else {
        dispatch(
          showError(
            res.message ||
              "No se pudo crear la sucursal. Intenta nuevamente más tarde.",
          ),
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      dispatch(
        showError(
          error.message ||
            "No se pudo crear la sucursal. Intenta nuevamente más tarde.",
        ),
      );
    }
  };

  const editarSucursalExistente = async () => {
    try {
      const res = await editarSucursal(token!, form);
      console.log(res);

      if (res.success) {
        dispatch(showSuccess("Sucursal editada con exito"));
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      dispatch(
        showError(
          error.message ||
            "No se pudo editar la sucursal. Intenta nuevamente más tarde.",
        ),
      );
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="absolute top-1/2 left-1/2  max-w-4/5 md:max-w-6xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-8 shadow-lg font-sans overflow-auto max-h-screen">
        <div className="flex items-center justify-center my-4 text-center w-full">
          <span className=" font-bold">
            {initialData ? "Editar Sucursal" : "Nueva Sucursal"}
          </span>
        </div>

        <div>
          <Stepper activeStep={activeStep} alternativeLabel className="mb-8">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>
                  {index === 1 && `Cajas (${form.cajas.length})`}

                  {index === 2 && `Barreras (${form.barreras.length})`}

                  {index === 3 && `Grúas (${form.gruas.length})`}

                  {index !== 1 && index !== 2 && index !== 3 && label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === 0 && (
            <DatosGeneralesStep form={form} setForm={setForm} next={nextStep} />
          )}
          {activeStep === 1 && (
            <CajasStep
              form={form}
              setForm={setForm}
              next={nextStep}
              back={previousStep}
            />
          )}
          {activeStep === 2 && (
            <BarrerasStep
              form={form}
              setForm={setForm}
              next={nextStep}
              back={previousStep}
            />
          )}
          {activeStep === 3 && (
            <GruasStep
              form={form}
              setForm={setForm}
              next={nextStep}
              back={previousStep}
            />
          )}

          {activeStep === 4 && (
            <ResumenStep
              form={form}
              back={previousStep}
              save={handleSubmit}
              loading={loading}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
