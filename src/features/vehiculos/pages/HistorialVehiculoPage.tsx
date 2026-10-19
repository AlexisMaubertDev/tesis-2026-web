import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import PageLayout from "../../../components/layout/PageLayout";
import MainLayout from "../../../components/layout/MainLayout";
import BreadcrumbsMenu from "../../../components/ui/BreadcrumbsMenu";
import type { Acarreo } from "../../../types/Acarreo";
import { obtenerAcarreosPorPatente } from "../services/vehiculosService";
import { ListaAcarreos } from "../components/VehiculoDetalle";

/**
 * Historial de acarreos de un vehículo (página compartida por todos los roles
 * autenticados). Muestra sólo la lista de acarreos, con las mismas tarjetas
 * que el modal "Ver más" (`AcarreoDetalleCard`).
 */
export default function HistorialVehiculoPage() {
  const { patente = "" } = useParams();
  const { token } = useSelector((state: RootState) => state.auth);
  const [acarreos, setAcarreos] = useState<Acarreo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      if (!token || !patente) return;

      setLoading(true);
      setError(null);

      try {
        const res = await obtenerAcarreosPorPatente(token, patente);
        if (activo) setAcarreos(res.data as Acarreo[]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (!activo) return;
        setError(
          err.response?.data?.message ||
            "No se pudo cargar el historial. Intenta nuevamente más tarde.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [token, patente]);

  return (
    <PageLayout>
      <MainLayout>
        <aside className="w-full p-4 text-sm">
          <BreadcrumbsMenu
            page={patente ? `Historial ${patente}` : "Historial"}
            links={[{ name: "Vehículos", href: "/vehiculos" }]}
          />
        </aside>

        <main className="flex flex-col justify-start items-center py-4 px-4 w-full">
          <section className="w-full max-w-3xl rounded-lg bg-cerulean-100 p-6 shadow-lg flex flex-col gap-2">
            <ListaAcarreos
              acarreos={acarreos}
              loading={loading}
              error={error}
            />
          </section>
        </main>
      </MainLayout>
    </PageLayout>
  );
}
