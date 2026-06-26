import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import PageLayout from "../../../components/layout/PageLayout";
import BreadcrumbsMenu from "../../../components/ui/BreadcrumbsMenu";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import GruasTable from "../components/GruasTable";
import type { Grua } from "../../../types/Grua";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { obtenerGruas } from "../services/gruasServices";
import NuevaGruaModal from "../components/GruaModal";

export default function GruasPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [gruas, setGruas] = useState<Grua[]>([]);

  useEffect(() => {
    const cargarGruas = async () => {
      try {
        const res = await obtenerGruas(token!);
        setGruas(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(error.message);
      }
    };
    cargarGruas();
  }, [token]);

  return (
    <PageLayout>
      <MainLayout>
        <aside className="w-full p-4 text-sm">
          <BreadcrumbsMenu page="Gruas" />
        </aside>
        <main className="flex flex-col justify-start items-center py-4 px-4">
          <section className="flex flex-col md:flex-row justify-between items-start lg:items-center w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 gap-4">
            <h1 className=" sm:text-lg font-bold uppercase self-center">
              Gruas
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
                Agregar Grúa
              </CallToActionButton>
            </div>
          </section>
          <section className="w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 overflow-x-hidden">
            <GruasTable gruas={gruas} />
          </section>
          <NuevaGruaModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          />
        </main>
      </MainLayout>
    </PageLayout>
  );
}
