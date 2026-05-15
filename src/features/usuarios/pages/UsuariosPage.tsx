import { useEffect, useState } from "react";
import type { Usuario } from "../../../types/Usuario.ts";
import PageLayout from "../../../components/layout/PageLayout.tsx";
import MainLayout from "../../../components/layout/MainLayout.tsx";
import { obtenerUsuarios } from "../services/usuariosService.ts";
import type { RootState } from "../../../app/store/index.ts";
import { useSelector } from "react-redux";
import UsuariosTable from "../components/UsuariosTable.tsx";
import CallToActionButton from "../../../components/ui/CallToActionButton.tsx";

export default function UsuariosPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    if (!token) return;

    const cargarUsuarios = async () => {
      try {
        const res = await obtenerUsuarios(token);
        setUsuarios(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(error.response?.data);
      }
    };

    cargarUsuarios();
  }, [token]);

  console.log(usuarios);

  return (
    <PageLayout>
      <MainLayout>
        <main className="flex flex-col justify-start items-center py-4 px-4">
          <section className="flex flex-col md:flex-row justify-between items-start lg:items-center w-full bg-san-marino-200 rounded shadow p-4 mt-4 mx-4 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold uppercase">
              Usuarios
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
              <CallToActionButton
                type="button"
                handleSubmit={() => window.location.reload()}
              >
                Refrescar
              </CallToActionButton>

              <CallToActionButton type="button" handleSubmit={() => {}}>
                Agregar Usuario
              </CallToActionButton>
            </div>
          </section>
          {/* <button
            className="bg-san-marino-500 text-white uppercase px-8 py-4 rounded hover:bg-san-marino-600 transition-colors cursor-pointer"
            onClick={cargarUsuarios}
          >
            Recargar Usuarios
          </button> */}
          <section className="w-full bg-san-marino-200 rounded shadow p-4 mt-4 mx-4 overflow-x-hidden">
            <UsuariosTable usuarios={usuarios} />
          </section>
        </main>
      </MainLayout>
    </PageLayout>
  );
}
