import { useEffect, useState } from "react";
import type { RootState } from "../../../app/store";
import MainLayout from "../../../components/layout/MainLayout";
import PageLayout from "../../../components/layout/PageLayout";
import BreadcrumbsMenu from "../../../components/ui/BreadcrumbsMenu";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import { useSelector } from "react-redux";
import BarrerasTable from "../components/BarrerasTable";
import SkeletonCarga from "../../../components/ui/SkeletonCarga";
import type { Barrera } from "../../../types/Barrera";
import { obtenerBarreras } from "../services/barrerasService";

export default function BarrerasPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [barreras, setBarreras] = useState<Barrera[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarBarreras = async () => {
      setCargando(true);
      try {
        const res = await obtenerBarreras(token!);
        setBarreras(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(error.message);
      } finally {
        setCargando(false);
      }
    };
    cargarBarreras();
  }, [token]);

  return (
    <PageLayout>
      <MainLayout>
        <aside className="w-full p-4 text-sm">
          <BreadcrumbsMenu page="Barreras" />
        </aside>{" "}
        <section className="flex flex-col md:flex-row justify-between items-start lg:items-center w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 gap-4">
          <h1 className=" sm:text-lg font-bold uppercase self-center">
            Barreras
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
            <CallToActionButton
              type="button"
              handleSubmit={() => window.location.reload()}
            >
              Refrescar
            </CallToActionButton>
          </div>
        </section>
        <section className="w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 overflow-x-hidden">
          {cargando ? (
            <SkeletonCarga filas={6} alto={40} />
          ) : (
            <BarrerasTable barreras={barreras} />
          )}
        </section>
      </MainLayout>
    </PageLayout>
  );
}
