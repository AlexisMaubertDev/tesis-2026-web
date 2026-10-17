import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import PageLayout from "../../../components/layout/PageLayout";
import BreadcrumbsMenu from "../../../components/ui/BreadcrumbsMenu";
import type { Vehiculo } from "../../../types/Vehiculo";
import VehiculosTable from "../components/VehiculosTable";
import EditarVehiculoModal from "../components/EditarVehiculoModal";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { obtenerVehiculos } from "../services/vehiculosService";

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [vehiculoAEditar, setVehiculoAEditar] = useState<Vehiculo | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { token } = useSelector((state: RootState) => state.auth);

  const recargar = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    if (!token) return;

    const cargarVehiculos = async () => {
      try {
        const res = await obtenerVehiculos(token);
        setVehiculos(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(error.response?.message);
      }
    };

    cargarVehiculos();
  }, [token, refreshKey]);

  return (
    <PageLayout>
      <MainLayout>
        <aside className="w-full p-4 text-sm">
          <BreadcrumbsMenu page="Vehiculos" />
        </aside>
        <main className="flex flex-col justify-start items-center py-4 px-4">
          <section className="flex flex-col md:flex-row justify-between items-start lg:items-center w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 gap-4">
            <h1 className=" sm:text-lg font-bold uppercase self-center">
              Vehiculos
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto"></div>
          </section>
          <section className="flex flex-col md:flex-row justify-between items-start lg:items-center w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 gap-4">
            {vehiculos.length === 0 ? (
              <p className="text-center text-cerulean-600 font-bold">
                No se encontraron vehículos
              </p>
            ) : (
              <VehiculosTable
                vehiculos={vehiculos}
                onEditar={setVehiculoAEditar}
                onDeleted={recargar}
              />
            )}
          </section>

          {vehiculoAEditar && (
            <EditarVehiculoModal
              key={vehiculoAEditar.id ?? vehiculoAEditar.patente}
              open
              vehiculo={vehiculoAEditar}
              onClose={() => setVehiculoAEditar(null)}
              onSuccess={recargar}
            />
          )}
        </main>
      </MainLayout>
    </PageLayout>
  );
}
