import { useEffect, useState } from "react";
import { obtenerCajasSucursal } from "../../cajas/services/cajasService";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { Navigate } from "react-router-dom";
import type { Caja } from "../../../types/Caja";
import PageLayout from "../../../components/layout/PageLayout";
import MainLayout from "../../../components/layout/MainLayout";
import SelectCajas from "../components/SelectCajas";
import { cerrarTurno_Caja } from "../../usuarios/services/usuariosService";
import { terminarTurnoCaja } from "../../../app/store/authSlice";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import { showError, showSuccess } from "../../../app/store/snackbarSlice";
import { getTurnoLabel } from "../../../app/constants/turnos";
import BuscarVehiculoPatente from "../../vehiculos/components/BuscarVehiculoPatente";
import CobrosTurno from "../components/CobrosTurno";

export default function CajerosPage() {
  const { usuario, token } = useSelector((state: RootState) => state.auth);
  const [cajas, setCajas] = useState<Caja[]>([]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!token || !usuario) return;

    const cargarCajas = async () => {
      try {
        const res = await obtenerCajasSucursal(token, usuario.Sucursal.id!);
        setCajas(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(error.response?.data);
      }
    };

    cargarCajas();
  }, [token, usuario]);

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (usuario.rol !== "CAJERO") {
    return <Navigate to="/" replace />;
  }

  const handleCerrarTurno = async () => {
    try {
      await cerrarTurno_Caja(token!, usuario.Turno_Caja!.id!);

      dispatch(terminarTurnoCaja());

      dispatch(showSuccess("Turno cerrado correctamente"));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error.response?.data);
      dispatch(showError(error.response?.data?.message));
    }
  };

  return (
    <PageLayout>
      <MainLayout>
        <main className="flex flex-col justify-start items-center py-4 px-4">
          <section className="w-full max-w-6xl mt-4">
            <BuscarVehiculoPatente />
          </section>

          {!usuario.Turno_Caja ? (
            <section className="flex flex-col  max-w-6xl justify-between items-start lg:items-center w-full mt-4  gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start lg:items-center w-full bg-cerulean-100 rounded shadow p-4 gap-4">
                <h1 className=" sm:text-lg  font-bold uppercase self-center">
                  Cajas - {usuario.Sucursal.nombre}
                </h1>
              </div>
              <SelectCajas cajas={cajas} />
            </section>
          ) : (
            <section className="flex flex-col  max-w-6xl justify-between items-start lg:items-center w-full mt-4  gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start lg:items-center w-full bg-cerulean-100 rounded shadow p-4 gap-4">
                <h1 className=" sm:text-lg  font-bold uppercase self-center">
                  Caja N°: {usuario.Turno_Caja.Caja.numero_caja}
                </h1>
                <h2>
                  Turno: {getTurnoLabel(usuario.Turno_Caja.turno)}
                </h2>
                <h2>Referencia: {usuario.Turno_Caja.Caja.referencia}</h2>

                <CallToActionButton
                  type="button"
                  handleSubmit={handleCerrarTurno}
                >
                  Cerrar Turno
                </CallToActionButton>
              </div>

              <CobrosTurno />
            </section>
          )}
        </main>
      </MainLayout>
    </PageLayout>
  );
}
