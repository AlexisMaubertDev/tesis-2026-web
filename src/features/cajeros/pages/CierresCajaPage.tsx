import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../../../app/store";
import MainLayout from "../../../components/layout/MainLayout";
import PageLayout from "../../../components/layout/PageLayout";
import BreadcrumbsMenu from "../../../components/ui/BreadcrumbsMenu";
import TurnosCerradosTable from "../components/TurnosCerradosTable";

export default function CierresCajaPage() {
  const { usuario } = useSelector((state: RootState) => state.auth);

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (usuario.rol !== "CAJERO") {
    return <Navigate to="/" replace />;
  }

  return (
    <PageLayout>
      <MainLayout>
        <aside className="w-full p-4 text-sm">
          <BreadcrumbsMenu
            page="Cierres de caja"
            links={[{ name: "Cajero", href: "/cajeros" }]}
          />
        </aside>

        <main className="flex flex-col justify-start items-center py-4 px-4">
          <TurnosCerradosTable />
        </main>
      </MainLayout>
    </PageLayout>
  );
}
