import { useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import PageLayout from "../../../components/layout/PageLayout";
import MainLayout from "../../../components/layout/MainLayout";
import type { RootState } from "../../../app/store";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import { useEffect, useState } from "react";
import type { Caja } from "../../../types/Caja";
import type { Grua } from "../../../types/Grua";
import { obtenerCajasSucursal } from "../../cajas/services/cajasService";

export default function SupervisorPage() {
  const { usuario, token } = useSelector((state: RootState) => state.auth);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [gruas, setGruas] = useState<Grua[]>([]);

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (usuario.rol !== "SUPERVISOR") {
    return <Navigate to="/" replace />;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!token) return;

    const cargarCajas = async () => {
      try {
        const res = await obtenerCajasSucursal(token, usuario.Sucursal.id);
        setCajas(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(error.response?.data);
      }
    };

    // const cargarGruas = async () => {
    //   try {
    //     const res = await obtenerGruasSucursal(token, usuario.Sucursal.id);
    //     setGruas(res.data);
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   } catch (error: any) {
    //     console.error(error.message);
    //   }
    // };

    // cargarGruas();

    cargarCajas();
  }, [token, usuario.Sucursal.id]);

  console.log(cajas);

  return (
    <PageLayout>
      <MainLayout>
        <main className="flex flex-col justify-start items-center py-4 px-4">
          <section className="flex max-w-6xl flex-col sm:flex-row justify-between items-start lg:items-center w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 gap-4">
            <div>
              <h1 className=" sm:text-lg font-bold uppercase self-center">
                {usuario.Sucursal.nombre}
              </h1>
              <span className="text-sm"> {usuario.Sucursal.direccion}</span>
            </div>
            <ul className="flex w-full gap-2 sm:justify-end flex-wrap">
              <li>
                <CallToActionButton type="button">
                  <Link
                    to={`/supervisor/usuarios?sucursal=${usuario.Sucursal.nombre}`}
                  >
                    Usuarios
                  </Link>
                </CallToActionButton>
              </li>

              <li>
                <CallToActionButton type="button">
                  <Link
                    to={`/supervisor/cajas?sucursal=${usuario.Sucursal.nombre}`}
                  >
                    Cajas
                  </Link>
                </CallToActionButton>
              </li>

              <li>
                <CallToActionButton type="button">
                  <Link
                    to={`/supervisor/gruas?sucursal=${usuario.Sucursal.nombre}`}
                  >
                    Gruas
                  </Link>
                </CallToActionButton>
              </li>

              <li>
                <CallToActionButton type="button">
                  <Link
                    to={`/supervisor/barreras?sucursal=${usuario.Sucursal.nombre}`}
                  >
                    Barreras
                  </Link>
                </CallToActionButton>
              </li>
            </ul>
          </section>
          {/* CAJAS */}
          <section className="flex flex-col md:flex-row justify-between items-start lg:items-center w-full p-4 mt-4 mx-4 gap-4">
            <h1 className=" sm:text-lg font-bold uppercase self-center">
              Cajas
            </h1>
          </section>
          <section className="flex flex-col md:flex-row justify-between items-start lg:items-center w-full p-4 mt-4 mx-4 gap-4">
            <h1 className=" sm:text-lg font-bold uppercase self-center">
              Grúas
            </h1>
          </section>
        </main>
      </MainLayout>
    </PageLayout>
  );
}
