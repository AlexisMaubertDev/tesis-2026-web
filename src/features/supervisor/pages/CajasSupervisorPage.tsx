import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { showError } from "../../../app/store/snackbarSlice";
import PageLayout from "../../../components/layout/PageLayout";
import MainLayout from "../../../components/layout/MainLayout";
import BreadcrumbsMenu from "../../../components/ui/BreadcrumbsMenu";
import Search from "../../../components/ui/Search";
import CajasTable from "../../cajas/components/CajasTable";
import { obtenerCajasSucursal } from "../../cajas/services/cajasService";
import type { Caja } from "../../../types/Caja";

/**
 * Página exclusiva del supervisor: lista las cajas de su sucursal. Cada caja
 * tiene su historial de turnos (con filtro por fecha) y las incidencias de cada
 * turno.
 */
export default function CajasSupervisorPage() {
  const { token, usuario } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [cajas, setCajas] = useState<Caja[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const idSucursal = usuario?.Sucursal?.id;
    if (!token || !idSucursal) return;

    let activo = true;

    const cargar = async () => {
      try {
        const res = await obtenerCajasSucursal(token, idSucursal);
        if (!activo) return;
        setCajas(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (!activo) return;

        if (error.response?.status === 404) {
          setCajas([]);
          return;
        }

        dispatch(
          showError(
            error.response?.data?.message || "No se pudieron cargar las cajas.",
          ),
        );
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [token, usuario, dispatch]);

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (usuario.rol !== "SUPERVISOR") {
    return <Navigate to="/" replace />;
  }

  const texto = search.trim().toLowerCase();
  const cajasFiltradas = texto
    ? cajas.filter((caja) =>
        `${caja.numero_caja} ${caja.referencia} ${caja.referencia_pago}`
          .toLowerCase()
          .includes(texto),
      )
    : cajas;

  return (
    <PageLayout>
      <MainLayout>
        <aside className="w-full p-4 text-sm">
          <BreadcrumbsMenu
            page="Cajas"
            links={[{ name: "Supervisor", href: "/supervisor" }]}
          />
        </aside>
        <main className="flex flex-col justify-start items-center py-4 px-4">
          <section className="flex flex-col md:flex-row justify-between items-start lg:items-center w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 gap-4">
            <h1 className="sm:text-lg font-bold uppercase self-center">
              Cajas · {usuario.Sucursal.nombre}
            </h1>

            <div className="w-full md:w-auto">
              <Search
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onSearch={() => {}}
                title="Buscar por número, referencia o referencia de pago"
              />
            </div>
          </section>

          <section className="w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 overflow-x-auto">
            <CajasTable cajas={cajasFiltradas} />
          </section>
        </main>
      </MainLayout>
    </PageLayout>
  );
}
