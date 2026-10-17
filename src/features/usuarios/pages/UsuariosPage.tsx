import { useEffect, useState } from "react";
import type { Usuario } from "../../../types/Usuario.ts";
import PageLayout from "../../../components/layout/PageLayout.tsx";
import MainLayout from "../../../components/layout/MainLayout.tsx";
import { obtenerUsuarios } from "../services/usuariosService.ts";
import type { RootState } from "../../../app/store/index.ts";
import { useDispatch, useSelector } from "react-redux";
import UsuariosTable from "../components/UsuariosTable.tsx";
import CallToActionButton from "../../../components/ui/CallToActionButton.tsx";
import NuevoUsuarioModal from "../components/NuevoUsuarioModal.tsx";
import CambiarRolModal from "../components/CambiarRolModal.tsx";
import UsuarioDetalleModal from "../components/UsuarioDetalleModal.tsx";
import { showError } from "../../../app/store/snackbarSlice.ts";
import Search from "../../../components/ui/Search.tsx";
import FilterMenu from "../components/FilterMenu.tsx";
import { obtenerSucursales } from "../../sucursales/services/sucursalesService.ts";
import { useSearchParams } from "react-router-dom";
import BreadcrumbsMenu from "../../../components/ui/BreadcrumbsMenu.tsx";

export type FiltrosUsuarios = {
  sucursales: string[];
  turnos: number[];
  trabajaDomingos: boolean | null;
  bloqueados: boolean;
};

// La búsqueda es por nombre, apellido, email, dni o legajo. `legajo` y `dni`
// llegan como número desde la API, por eso también se comparan como texto.
const coincideBusqueda = (usuario: Usuario, texto: string) => {
  const buscado = texto.trim().toLowerCase();

  if (!buscado) return true;

  return (
    usuario.nombre.toLowerCase().includes(buscado) ||
    usuario.apellido.toLowerCase().includes(buscado) ||
    (usuario.email ?? "").toLowerCase().includes(buscado) ||
    String(usuario.legajo).toLowerCase().includes(buscado) ||
    String(usuario.dni).toLowerCase().includes(buscado)
  );
};

const coincideFiltros = (
  usuario: Usuario,
  filtros: FiltrosUsuarios,
): boolean => {
  const cumpleSucursal =
    filtros.sucursales.length === 0 ||
    filtros.sucursales.includes(usuario.Sucursal.nombre);

  const cumpleTurno =
    filtros.turnos.length === 0 || filtros.turnos.includes(usuario.numero_turno);

  const cumpleDomingos =
    !filtros.trabajaDomingos || usuario.trabaja_domingo === true;

  const cumpleBloqueados = !filtros.bloqueados || usuario.bloqueado === true;

  return cumpleSucursal && cumpleTurno && cumpleDomingos && cumpleBloqueados;
};

/** Aplica el texto del buscador y el menú de filtros sobre los usuarios. */
const aplicarFiltrosUsuarios = (
  usuarios: Usuario[],
  texto: string,
  filtros: FiltrosUsuarios,
) =>
  usuarios.filter(
    (usuario) =>
      coincideBusqueda(usuario, texto) && coincideFiltros(usuario, filtros),
  );

export default function UsuariosPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [searchParams] = useSearchParams();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sucursales, setSucursales] = useState<
    { id: string; nombre: string; direccion: string }[]
  >([]);
  const [filtros, setFiltros] = useState<FiltrosUsuarios>({
    sucursales: [],
    turnos: [],
    trabajaDomingos: null,
    bloqueados: false,
  });
  const [nuevoUsuarioModalOpen, setNuevoUsuarioModalOpen] = useState(false);
  const [usuarioAEditar, setUsuarioAEditar] = useState<Usuario | null>(null);
  const [usuarioCambioRol, setUsuarioCambioRol] = useState<Usuario | null>(null);
  const [usuarioDetalle, setUsuarioDetalle] = useState<Usuario | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const dispatch = useDispatch();

  const recargar = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    if (!token) return;

    const cargarUsuarios = async () => {
      try {
        const res = await obtenerUsuarios(token);
        setUsuarios(res.data);
        setUsuariosFiltrados(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        dispatch(
          showError(
            error.response?.data?.message ||
              "Error al cargar usuarios. Intenta nuevamente más tarde.",
          ),
        );
      }
    };

    cargarUsuarios();
  }, [token, dispatch, refreshKey]);

  const buscarUsuarios = () =>
    setUsuariosFiltrados(aplicarFiltrosUsuarios(usuarios, search, filtros));

  useEffect(() => {
    if (!token) return;

    const cargarSucursales = async () => {
      try {
        const res = await obtenerSucursales(token);
        setSucursales(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(error.response?.data);
      }
    };

    cargarSucursales();
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsuariosFiltrados(aplicarFiltrosUsuarios(usuarios, search, filtros));
  }, [usuarios, search, filtros]);

  useEffect(() => {
    const nuevosFiltros: FiltrosUsuarios = {
      sucursales: [],
      turnos: [],
      trabajaDomingos: null,
      bloqueados: false,
    };

    const sucursal = searchParams.get("sucursal");
    const turno = searchParams.get("turno");
    const domingos = searchParams.get("domingos");
    const bloqueados = searchParams.get("bloqueados");

    if (sucursal) nuevosFiltros.sucursales = [sucursal];

    if (turno) nuevosFiltros.turnos = [Number(turno)];

    if (domingos === "true") nuevosFiltros.trabajaDomingos = true;

    if (bloqueados === "true") nuevosFiltros.bloqueados = true;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFiltros(nuevosFiltros);
  }, [searchParams]);

  return (
    <PageLayout>
      <MainLayout>
        <aside className="w-full p-4 text-sm">
          <BreadcrumbsMenu page="Usuarios" />
        </aside>
        <main className="flex flex-col justify-start items-center py-4 px-4">
          <section className="flex flex-col md:flex-row justify-between items-start lg:items-center w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 gap-4">
            <h1 className=" sm:text-lg font-bold uppercase self-center">
              Usuarios
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full md:w-auto">
              <div className="flex gap-2 w-full sm:col-span-2">
                <Search
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onSearch={buscarUsuarios}
                  title="Buscar por nombre, apellido, email, dni o legajo"
                />
                <FilterMenu
                  filtros={filtros}
                  setFiltros={setFiltros}
                  sucursales={sucursales}
                />
              </div>
              <CallToActionButton type="button" handleSubmit={recargar}>
                Refrescar
              </CallToActionButton>

              <CallToActionButton
                type="button"
                handleSubmit={() => setNuevoUsuarioModalOpen(true)}
              >
                Agregar Usuario
              </CallToActionButton>
            </div>
          </section>

          <section className="w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 overflow-x-hidden">
            <UsuariosTable
              usuarios={usuariosFiltrados}
              onEditar={setUsuarioAEditar}
              onCambiarRol={setUsuarioCambioRol}
              onVerDetalle={setUsuarioDetalle}
              onDeleted={recargar}
            />
          </section>

          {nuevoUsuarioModalOpen && (
            <NuevoUsuarioModal
              open
              onClose={() => setNuevoUsuarioModalOpen(false)}
              sucursales={sucursales}
              onSuccess={recargar}
            />
          )}

          {usuarioAEditar && (
            <NuevoUsuarioModal
              key={usuarioAEditar.legajo}
              open
              usuario={usuarioAEditar}
              onClose={() => setUsuarioAEditar(null)}
              sucursales={sucursales}
              onSuccess={recargar}
            />
          )}

          {usuarioCambioRol && (
            <CambiarRolModal
              key={usuarioCambioRol.legajo}
              open
              usuario={usuarioCambioRol}
              onClose={() => setUsuarioCambioRol(null)}
              onSuccess={recargar}
            />
          )}

          {usuarioDetalle && (
            <UsuarioDetalleModal
              key={usuarioDetalle.legajo}
              open
              usuario={usuarioDetalle}
              onClose={() => setUsuarioDetalle(null)}
            />
          )}
        </main>
      </MainLayout>
    </PageLayout>
  );
}
