import MainLayout from "../../../components/layout/MainLayout";
import PageLayout from "../../../components/layout/PageLayout";
import BreadcrumbsMenu from "../../../components/ui/BreadcrumbsMenu";

type Props = {};

export default function VehiculosPage({}: Props) {
  return (
    <PageLayout>
      <MainLayout>
        <aside className="w-full p-4 text-sm">
          <BreadcrumbsMenu page="Vehiculos" />
        </aside>
        <main className="flex flex-col justify-start items-center py-4 px-4"></main>
      </MainLayout>
    </PageLayout>
  );
}
