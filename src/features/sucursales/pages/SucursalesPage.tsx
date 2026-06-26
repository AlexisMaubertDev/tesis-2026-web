import MainLayout from "../../../components/layout/MainLayout";
import PageLayout from "../../../components/layout/PageLayout";
import SucursalesTable from "../components/SucursalesTable";
import type { RootState } from "../../../app/store";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import type { Sucursal } from "../../../types/Sucursal";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import SucursalModal from "../components/SucursalModal";
import { obtenerSucursales } from "../services/sucursalesService";
import BreadcrumbsMenu from "../../../components/ui/BreadcrumbsMenu";

export default function SucursalesPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(
    null,
  );

  const handleEdit = (sucursal: Sucursal) => {
    setSelectedSucursal(sucursal);
    setModalOpen(true);
  };
  useEffect(() => {
    if (!token) return;

    const cargarSucursales = async () => {
      try {
        const res = await obtenerSucursales(token);
        setSucursales(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(error.response?.message);
      }
    };

    cargarSucursales();
  }, [token]);

  return (
    <PageLayout>
      <MainLayout>
        <aside className="w-full p-4 text-sm">
          <BreadcrumbsMenu page="Sucursales" />
        </aside>
        <main className="flex flex-col justify-start items-center py-4 px-4">
          <section className="flex flex-col md:flex-row justify-between items-start lg:items-center w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 gap-4">
            <h1 className=" sm:text-lg font-bold uppercase self-center">
              Sucursales
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
                handleSubmit={() => setModalOpen(true)}
              >
                Agregar Sucursal
              </CallToActionButton>
            </div>
          </section>

          <section className="w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 overflow-x-hidden">
            <SucursalesTable sucursales={sucursales} handleEdit={handleEdit} />
          </section>
        </main>
        {modalOpen && (
          <SucursalModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            initialData={selectedSucursal}
          />
        )}
      </MainLayout>
    </PageLayout>
  );
}
