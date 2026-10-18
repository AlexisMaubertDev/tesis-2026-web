import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import MainLayout from "../../../components/layout/MainLayout";
import PageLayout from "../../../components/layout/PageLayout";
import BreadcrumbsMenu from "../../../components/ui/BreadcrumbsMenu";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import type { RootState } from "../../../app/store";
import type { Tarifa } from "../../../types/Tarifa";
import NuevaTarifaModal from "../components/NuevaTarifaModal";
import TarifasTable from "../components/TarifasTable";
import { obtenerTarifas } from "../services/tarifasService";

/**
 * Historial de tarifas (CU20, rol Sistemas). Muestra la vigente y las cerradas,
 * y permite configurar una nueva desde el modal.
 */
export default function TarifasPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarTarifas = async () => {
      try {
        const res = await obtenerTarifas(token!);
        setTarifas(res.data);
        setError(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "No se pudieron cargar las tarifas. Intentá nuevamente más tarde.",
        );
      }
    };

    cargarTarifas();
  }, [token, refreshKey]);

  const vigente = tarifas.find((tarifa) => tarifa.vigente) ?? null;

  return (
    <PageLayout>
      <MainLayout>
        <aside className="w-full p-4 text-sm">
          <BreadcrumbsMenu page="Tarifas" />
        </aside>
        <main className="flex flex-col justify-start items-center py-4 px-4">
          <section className="flex flex-col md:flex-row justify-between items-start lg:items-center w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 gap-4">
            <h1 className="sm:text-lg font-bold uppercase self-center">
              Tarifas
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
              <CallToActionButton
                type="button"
                handleSubmit={() => setRefreshKey((n) => n + 1)}
              >
                Refrescar
              </CallToActionButton>

              <CallToActionButton
                type="button"
                handleSubmit={() => setModalOpen(true)}
              >
                Agregar tarifa
              </CallToActionButton>
            </div>
          </section>

          <section className="w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 overflow-x-hidden">
            {error ? (
              <p className="text-xs text-scarlet-rush-700">{error}</p>
            ) : (
              <TarifasTable tarifas={tarifas} />
            )}
          </section>

          <NuevaTarifaModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            vigente={vigente}
            onSuccess={() => setRefreshKey((n) => n + 1)}
          />
        </main>
      </MainLayout>
    </PageLayout>
  );
}
