import { useEffect, useState } from "react";
import { obtenerCajasSucursal } from "../../cajas/services/cajasService";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { Navigate } from "react-router-dom";
import type { Caja } from "../../../types/Caja";
import PageLayout from "../../../components/layout/PageLayout";
import MainLayout from "../../../components/layout/MainLayout";
import SelectCajas from "../components/SelectCajas";
import { obtenerTurnoCajasUsuario } from "../../usuarios/services/usuariosService";
import { terminarTurnoCaja } from "../../../app/store/authSlice";

export default function CajerosPage() {
  const { usuario, token } = useSelector((state: RootState) => state.auth);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [turnoCajas, setTurnoCajas] = useState<Caja[]>([]);

  const dispatch = useDispatch();

  console.log(usuario);

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (usuario.rol !== "CAJERO") {
    return <Navigate to="/" replace />;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!token) return;

    // const obtenerTurnoCajas = async () => {
    //   try {
    //     const res = await obtenerTurnoCajasUsuario(token);
    //     console.log(res.data);
    //     setTurnoCajas(res.data);
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   } catch (error: any) {
    //     console.error(error.response?.data);
    //   }
    // };

    // dispatch(terminarTurnoCaja());

    const cargarCajas = async () => {
      try {
        const res = await obtenerCajasSucursal(token, usuario.Sucursal.id!);
        setCajas(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(error.response?.data);
      }
    };

    // obtenerTurnoCajas();

    cargarCajas();
  }, [token, usuario.Sucursal.id]);

  return (
    <PageLayout>
      <MainLayout>
        <main className="flex flex-col justify-start items-center py-4 px-4">
          {!usuario.Turno_Caja ? (
            <SelectCajas cajas={cajas} />
          ) : (
            <section className="flex flex-col  max-w-6xl justify-between items-start lg:items-center w-full mt-4  gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start lg:items-center w-full bg-cerulean-100 rounded shadow p-4 gap-4">
                <h1 className=" sm:text-lg  font-bold uppercase self-center">
                  Caja N°: {usuario.Turno_Caja.Caja.numero_caja}
                </h1>
                <h2>Turno: {usuario.Turno_Caja.turno}</h2>
                <h2>Referencia: {usuario.Turno_Caja.Caja.referencia}</h2>
              </div>
            </section>
          )}
        </main>
      </MainLayout>
    </PageLayout>
  );
}
