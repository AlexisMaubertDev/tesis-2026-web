import { useSelector } from "react-redux";
import MainLayout from "../components/layout/MainLayout";
import PageLayout from "../components/layout/PageLayout";
import type { RootState } from "../app/store";
import { Link, Navigate } from "react-router-dom";

export default function Home() {
  const { usuario } = useSelector((state: RootState) => state.auth);
  console.log(usuario);

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (usuario.rol === "PLAYERO") {
    return <Navigate to="/vehiculos" replace />;
  }
  if (usuario.rol === "CAJERO") {
    return <Navigate to="/cajeros" replace />;
  }
  if (usuario.rol === "SUPERVISOR") {
    return <Navigate to="/supervisor" replace />;
  }

  return (
    <PageLayout>
      <MainLayout>
        <main className="flex flex-col justify-start items-center py-4">
          <ul className="flex flex-col max-w-6xl w-full gap-2 p-4 items-center">
            {usuario.rol === "SISTEMAS" && (
              <li className="flex w-1/2">
                <Link
                  to="/sucursales"
                  className="w-full bg-scarlet-rush-500 text-white uppercase px-8 py-4 rounded hover:bg-scarlet-rush-700 transition-colors cursor-pointer text-center duration-300 "
                >
                  Sucursales
                </Link>
              </li>
            )}
            {usuario.rol === "SISTEMAS" && (
              <li className="flex w-1/2">
                <Link
                  to="/usuarios"
                  className="w-full bg-scarlet-rush-500 text-white uppercase px-8 py-4 rounded hover:bg-scarlet-rush-700 transition-colors cursor-pointer text-center duration-300 "
                >
                  Usuarios
                </Link>
              </li>
            )}
            {usuario.rol === "SISTEMAS" && (
              <li className="flex w-1/2">
                <Link
                  to="/cajas"
                  className="w-full bg-scarlet-rush-500 text-white uppercase px-8 py-4 rounded hover:bg-scarlet-rush-700 transition-colors cursor-pointer text-center duration-300 "
                >
                  Cajas
                </Link>
              </li>
            )}
            {usuario.rol === "SISTEMAS" && (
              <li className="flex w-1/2">
                <Link
                  to="/gruas"
                  className="w-full bg-scarlet-rush-500 text-white uppercase px-8 py-4 rounded hover:bg-scarlet-rush-700 transition-colors cursor-pointer text-center duration-300 "
                >
                  Gruas
                </Link>
              </li>
            )}
            {usuario.rol === "SISTEMAS" && (
              <li className="flex w-1/2">
                <Link
                  to="/barreras"
                  className="w-full bg-scarlet-rush-500 text-white uppercase px-8 py-4 rounded hover:bg-scarlet-rush-700 transition-colors cursor-pointer text-center duration-300 "
                >
                  Barreras
                </Link>
              </li>
            )}
            {usuario.rol === "SISTEMAS" && (
              <li className="flex w-1/2">
                <Link
                  to="/vehiculos"
                  className="w-full bg-scarlet-rush-500 text-white uppercase px-8 py-4 rounded hover:bg-scarlet-rush-700 transition-colors cursor-pointer text-center duration-300 "
                >
                  Vehículos
                </Link>
              </li>
            )}
          </ul>
        </main>
      </MainLayout>
    </PageLayout>
  );
}
