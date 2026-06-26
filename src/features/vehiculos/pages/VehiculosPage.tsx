import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import PageLayout from "../../../components/layout/PageLayout";
import BreadcrumbsMenu from "../../../components/ui/BreadcrumbsMenu";
import type { Vehiculo } from "../../../types/Vehiculo";
import VehiculosTable from "../components/VehiculosTable";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { obtenerVehiculos } from "../services/vehiculosService";

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const { token } = useSelector((state: RootState) => state.auth);

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
  }, [token]);

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
              <VehiculosTable vehiculos={vehiculos} />
            )}
          </section>
        </main>
      </MainLayout>
    </PageLayout>
  );
}
