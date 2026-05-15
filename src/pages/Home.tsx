import { useSelector } from "react-redux";
import MainLayout from "../components/layout/MainLayout";
import PageLayout from "../components/layout/PageLayout";
import type { RootState } from "../app/store";
import { Link } from "react-router-dom";

export default function Home() {
  const { usuario } = useSelector((state: RootState) => state.auth);

  return (
    <PageLayout>
      <MainLayout>
        <main className="flex flex-col justify-start items-center py-4">
          <ul className="flex flex-col max-w-4xl w-full gap-2 p-4 items-center">
            {usuario?.rol === "SISTEMAS" && (
              <li className="flex w-1/2">
                <Link
                  to="/usuarios"
                  className="w-full bg-san-marino-500 text-white uppercase px-8 py-4 rounded hover:bg-san-marino-600 transition-colors cursor-pointer text-center"
                >
                  Usuarios
                </Link>
              </li>
            )}
          </ul>
        </main>
      </MainLayout>
    </PageLayout>
  );
}
