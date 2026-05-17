import { useEffect, useState } from "react";
import type { Usuario } from "../../../types/Usuario.ts";
import PageLayout from "../../../components/layout/PageLayout.tsx";
import MainLayout from "../../../components/layout/MainLayout.tsx";
import { obtenerUsuarios } from "../services/usuariosService.ts";
import type { RootState } from "../../../app/store/index.ts";
import { useDispatch, useSelector } from "react-redux";
import UsuariosTable from "../components/UsuariosTable.tsx";
import CallToActionButton from "../../../components/ui/CallToActionButton.tsx";
import NuevoUsuarioModal from "../components/NuevoUsuarioModal.tsx";
import { showError } from "../../../app/store/snackbarSlice.ts";

export default function UsuariosPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nuevoUsuarioModalOpen, setNuevoUsuarioModalOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) return;

    const cargarUsuarios = async () => {
      try {
        const res = await obtenerUsuarios(token);
        setUsuarios(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        dispatch(
          showError(
            error.response?.data?.message ||
              "Error al cargar usuarios. Intenta nuevamente más tarde.",
          ),
        );
      }
    };

    cargarUsuarios();
  }, [token]);

  return (
    <PageLayout>
      <MainLayout>
        <main className="flex flex-col justify-start items-center py-4 px-4">
          <section className="flex flex-col md:flex-row justify-between items-start lg:items-center w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 gap-4">
            <h1 className=" sm:text-lg font-bold uppercase self-center">
              Usuarios
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
              <CallToActionButton
                type="button"
                handleSubmit={() => window.location.reload()}
              >
                Refrescar
              </CallToActionButton>

              <CallToActionButton
                type="button"
                handleSubmit={() => setNuevoUsuarioModalOpen(true)}
              >
                Agregar Usuario
              </CallToActionButton>
            </div>
          </section>

          <section className="w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 overflow-x-hidden">
            <UsuariosTable usuarios={usuarios} />
          </section>

          <NuevoUsuarioModal
            open={nuevoUsuarioModalOpen}
            onClose={() => setNuevoUsuarioModalOpen(false)}
          />
        </main>
      </MainLayout>
    </PageLayout>
  );
}
