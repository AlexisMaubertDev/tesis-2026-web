import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { showError } from "../../../app/store/snackbarSlice";
import PageLayout from "../../../components/layout/PageLayout";
import MainLayout from "../../../components/layout/MainLayout";
import BreadcrumbsMenu from "../../../components/ui/BreadcrumbsMenu";
import Search from "../../../components/ui/Search";
import GruasTable from "../../gruas/components/GruasTable";
import { obtenerGruasSucursal } from "../../gruas/services/gruasServices";
import type { Grua } from "../../../types/Grua";

/**
 * Página exclusiva del supervisor: lista las grúas de su sucursal. Cada grúa
 * tiene su historial de turnos (con filtro por fecha), las incidencias de cada
 * turno y la acción para cambiar su estado.
 */
export default function GruasSupervisorPage() {
  const { token, usuario } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [gruas, setGruas] = useState<Grua[]>([]);
  const [search, setSearch] = useState("");
  // Se incrementa para volver a pedir las grúas (tras cambiar un estado).
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const idSucursal = usuario?.Sucursal?.id;
    if (!token || !idSucursal) return;

    let activo = true;

    const cargar = async () => {
      try {
        const res = await obtenerGruasSucursal(token, idSucursal);
        if (!activo) return;
        setGruas(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (!activo) return;

        if (error.response?.status === 404) {
          setGruas([]);
          return;
        }

        dispatch(
          showError(
            error.response?.data?.message || "No se pudieron cargar las grúas.",
          ),
        );
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [token, usuario, refreshKey, dispatch]);

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (usuario.rol !== "SUPERVISOR") {
    return <Navigate to="/" replace />;
  }

  const texto = search.trim().toLowerCase();
  const gruasFiltradas = texto
    ? gruas.filter((grua) =>
        `${grua.numero} ${grua.patente} ${grua.modelo} ${grua.estado}`
          .toLowerCase()
          .includes(texto),
      )
    : gruas;

  return (
    <PageLayout>
      <MainLayout>
        <aside className="w-full p-4 text-sm">
          <BreadcrumbsMenu
            page="Grúas"
            links={[{ name: "Supervisor", href: "/supervisor" }]}
          />
        </aside>
        <main className="flex flex-col justify-start items-center py-4 px-4">
          <section className="flex flex-col md:flex-row justify-between items-start lg:items-center w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 gap-4">
            <h1 className="sm:text-lg font-bold uppercase self-center">
              Grúas · {usuario.Sucursal.nombre}
            </h1>

            <div className="w-full md:w-auto">
              <Search
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onSearch={() => {}}
                title="Buscar por número, patente, modelo o estado"
              />
            </div>
          </section>

          <section className="w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 overflow-x-auto">
            <GruasTable
              gruas={gruasFiltradas}
              puedeCambiarEstado
              onRefrescar={() => setRefreshKey((k) => k + 1)}
            />
          </section>
        </main>
      </MainLayout>
    </PageLayout>
  );
}
