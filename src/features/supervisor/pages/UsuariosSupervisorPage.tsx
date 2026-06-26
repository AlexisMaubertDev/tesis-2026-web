import { useEffect, useState } from "react";
import type { Usuario } from "../../../types/Usuario.ts";
import PageLayout from "../../../components/layout/PageLayout.tsx";
import MainLayout from "../../../components/layout/MainLayout.tsx";
import type { RootState } from "../../../app/store/index.ts";
import { useDispatch, useSelector } from "react-redux";
import { showError } from "../../../app/store/snackbarSlice.ts";
import Search from "../../../components/ui/Search.tsx";
import { obtenerSucursales } from "../../sucursales/services/sucursalesService.ts";
import { useSearchParams } from "react-router-dom";
import BreadcrumbsMenu from "../../../components/ui/BreadcrumbsMenu.tsx";
import UsuariosSupervisorTable from "../../supervisor/components/UsuariosSupervisorTable.tsx";
import { obtenerUsuarios } from "../../usuarios/services/usuariosService.ts";
import FilterMenu from "../../usuarios/components/FilterMenu.tsx";

export type FiltrosUsuarios = {
  sucursales: string[];
  turnos: number[];
  trabajaDomingos: boolean | null;
  bloqueados: boolean;
};

export default function UsuariosSupervisorPage() {
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
  const [search, setSearch] = useState("");
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const dispatch = useDispatch();

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
  }, [token, dispatch]);

  const buscarUsuarios = () => {
    const texto = search.trim().toLowerCase();

    if (!texto) {
      setUsuariosFiltrados(usuarios);
      return;
    }

    const resultados = usuarios.filter((usuario) => {
      return (
        usuario.nombre.toLowerCase().includes(texto) ||
        usuario.apellido.toLowerCase().includes(texto) ||
        usuario.email!.toLowerCase().includes(texto) ||
        usuario.legajo.toLowerCase().includes(texto) ||
        usuario.dni.toLowerCase().includes(texto)
      );
    });

    setUsuariosFiltrados(resultados);
  };

  const filtrarUsuarios = (usuarios: Usuario[], filtros: FiltrosUsuarios) => {
    return usuarios.filter((usuario) => {
      const cumpleSucursal =
        filtros.sucursales.length === 0 ||
        filtros.sucursales.includes(usuario.Sucursal.nombre);

      const cumpleTurno =
        filtros.turnos.length === 0 ||
        filtros.turnos.includes(usuario.numero_turno);

      const cumpleDomingos =
        !filtros.trabajaDomingos || usuario.trabaja_domingo === true;

      const cumpleBloqueados =
        !filtros.bloqueados || usuario.bloqueado === true;

      return (
        cumpleSucursal && cumpleTurno && cumpleDomingos && cumpleBloqueados
      );
    });
  };

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
    let resultado = [...usuarios];

    // Búsqueda
    if (search.trim()) {
      const texto = search.toLowerCase();

      resultado = resultado.filter((usuario) => {
        return (
          usuario.nombre.toLowerCase().includes(texto) ||
          usuario.apellido.toLowerCase().includes(texto) ||
          usuario.email?.toLowerCase().includes(texto) ||
          usuario.legajo.toString().toLowerCase().includes(texto) ||
          usuario.dni.toString().toLowerCase().includes(texto)
        );
      });
    }

    // Filtros
    resultado = filtrarUsuarios(resultado, filtros);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsuariosFiltrados(resultado);
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
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
            </div>
          </section>

          <section className="w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 overflow-x-hidden">
            <UsuariosSupervisorTable usuarios={usuariosFiltrados} />
          </section>
        </main>
      </MainLayout>
    </PageLayout>
  );
}
