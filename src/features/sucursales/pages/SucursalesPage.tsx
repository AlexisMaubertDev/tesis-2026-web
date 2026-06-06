import Breadcrumbs from "@mui/material/Breadcrumbs";
import MainLayout from "../../../components/layout/MainLayout";
import PageLayout from "../../../components/layout/PageLayout";
import Link from "@mui/material/Link";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SucursalesTable from "../components/SucursalesTable";
import type { RootState } from "../../../app/store";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { obtenerSucursales } from "../../usuarios/services/sucursalesService";
import type { Sucursal } from "../../../types/Sucursal";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import NuevaSucursalModal from "../components/NuevaSucursalModal";

export default function SucursalesPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!token) return;

    const cargarSucursales = async () => {
      try {
        const res = await obtenerSucursales(token);
        setSucursales(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(error.response?.data);
      }
    };

    cargarSucursales();
  }, [token]);

  return (
    <PageLayout>
      <MainLayout>
        <aside className="w-full p-4 text-sm">
          <Breadcrumbs
            aria-label="breadcrumb"
            separator={<NavigateNextIcon fontSize="small" />}
            classes={{ root: "text-sm! text-cerulean-600! font-bold!" }}
          >
            <Link href="/" underline="hover" color="inherit">
              Inicio
            </Link>
            <span>Sucursales</span>
          </Breadcrumbs>
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
            <SucursalesTable sucursales={sucursales} />
          </section>
        </main>
        <NuevaSucursalModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </MainLayout>
    </PageLayout>
  );
}
