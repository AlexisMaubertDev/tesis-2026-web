import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import PageLayout from "../../../components/layout/PageLayout";
import BreadcrumbsMenu from "../../../components/ui/BreadcrumbsMenu";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import Search from "../../../components/ui/Search";
import type { RootState } from "../../../app/store";
import { showError } from "../../../app/store/snackbarSlice";
import { toFechaInput } from "../../../app/hooks/dataParse";
import { ESTADOS_ACARREO } from "../../../app/constants/estados";
import type { Sucursal } from "../../../types/Sucursal";
import type { EstadoAcarreo, Vehiculo } from "../../../types/Vehiculo";
import type { Turno_Barrera } from "../../../types/Barrera";
import { obtenerSucursales } from "../../sucursales/services/sucursalesService";
import { obtenerMiTurnoBarrera } from "../../barreras/services/barrerasService";
import VehiculosTable from "../components/VehiculosTable";
import EditarVehiculoModal from "../components/EditarVehiculoModal";
import VehiculoDetalleModal from "../components/VehiculoDetalleModal";
import VehiculosFiltros from "../components/VehiculosFiltros";
import PlayeroHome from "../components/PlayeroHome";
import {
  abrirInformeVehiculosPdf,
  obtenerVehiculos,
} from "../services/vehiculosService";

export type FiltrosVehiculos = {
  sucursales: string[];
  estados: EstadoAcarreo[];
  fechaDesde: string;
  fechaHasta: string;
};

const FILTROS_VACIOS: FiltrosVehiculos = {
  sucursales: [],
  estados: [],
  fechaDesde: "",
  fechaHasta: "",
};

// Arma los filtros a partir de la URL. El home del playero enlaza a
// `/vehiculos?estado=INGRESADO&sucursal=<nombre>` para prefiltrar la tabla.
// `estado` se puede repetir para seleccionar más de un estado.
const filtrosDesdeParams = (params: URLSearchParams): FiltrosVehiculos => ({
  ...FILTROS_VACIOS,
  estados: params
    .getAll("estado")
    .filter((estado): estado is EstadoAcarreo =>
      (ESTADOS_ACARREO as string[]).includes(estado),
    ),
  sucursales: params.get("sucursal") ? [params.get("sucursal")!] : [],
});

// La búsqueda y los filtros se aplican sobre los datos que ya devolvió el
// servidor (la tabla ya viene ordenada: primero los que están en playa y
// después por fecha del último acarreo).
const aplicarFiltros = (
  lista: Vehiculo[],
  texto: string,
  filtros: FiltrosVehiculos,
) => {
  const busqueda = texto.trim().toLowerCase();

  return lista.filter((vehiculo) => {
    const cumpleBusqueda =
      !busqueda ||
      vehiculo.patente.toLowerCase().includes(busqueda) ||
      vehiculo.modelo.toLowerCase().includes(busqueda);

    const cumpleSucursal =
      filtros.sucursales.length === 0 ||
      (!!vehiculo.Sucursal &&
        filtros.sucursales.includes(vehiculo.Sucursal.nombre));

    const cumpleEstado =
      filtros.estados.length === 0 ||
      (!!vehiculo.ultimo_acarreo_estado &&
        filtros.estados.includes(vehiculo.ultimo_acarreo_estado));

    // La fecha se compara como texto `yyyy-MM-dd` en la zona horaria local, para
    // que coincida con la que se muestra en la tabla.
    const fecha = toFechaInput(vehiculo.ultimo_acarreo);
    const cumpleDesde =
      !filtros.fechaDesde || (fecha !== "" && fecha >= filtros.fechaDesde);
    const cumpleHasta =
      !filtros.fechaHasta || (fecha !== "" && fecha <= filtros.fechaHasta);

    return (
      cumpleBusqueda && cumpleSucursal && cumpleEstado && cumpleDesde && cumpleHasta
    );
  });
};

/** Tabla de vehículos: el comportamiento original de la pantalla. */
function VehiculosTabla() {
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [vehiculosFiltrados, setVehiculosFiltrados] = useState<Vehiculo[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [filtros, setFiltros] = useState<FiltrosVehiculos>(() =>
    filtrosDesdeParams(searchParams),
  );
  const [search, setSearch] = useState("");
  const [vehiculoAEditar, setVehiculoAEditar] = useState<Vehiculo | null>(null);
  const [vehiculoDetalle, setVehiculoDetalle] = useState<Vehiculo | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [generandoPdf, setGenerandoPdf] = useState(false);

  const recargar = () => setRefreshKey((k) => k + 1);

  // Si la URL trae filtros (por ejemplo, desde el home del playero), se
  // sincronizan con el estado local.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFiltros(filtrosDesdeParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    if (!token) return;

    const cargarVehiculos = async () => {
      try {
        const res = await obtenerVehiculos(token);
        setVehiculos(res.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        dispatch(
          showError(
            error.response?.data?.message ||
              "Error al cargar vehículos. Intenta nuevamente más tarde.",
          ),
        );
      }
    };

    cargarVehiculos();
  }, [token, dispatch, refreshKey]);

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
    setVehiculosFiltrados(aplicarFiltros(vehiculos, search, filtros));
  }, [vehiculos, search, filtros]);

  const buscarVehiculos = () =>
    setVehiculosFiltrados(aplicarFiltros(vehiculos, search, filtros));

  const generarPdf = async () => {
    if (!token || generandoPdf) return;

    setGenerandoPdf(true);

    try {
      await abrirInformeVehiculosPdf(token, {
        busqueda: search,
        sucursales: filtros.sucursales,
        estados: filtros.estados,
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      dispatch(
        showError(
          error.response?.data?.message ||
            "No se pudo generar el PDF del listado de vehículos.",
        ),
      );
    } finally {
      setGenerandoPdf(false);
    }
  };

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full md:w-auto">
              <div className="flex gap-2 w-full sm:col-span-2">
                <Search
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onSearch={buscarVehiculos}
                  title="Buscar por patente o modelo"
                />
                <VehiculosFiltros
                  sucursales={sucursales}
                  filtros={filtros}
                  setFiltros={setFiltros}
                />
              </div>
              <CallToActionButton type="button" handleSubmit={recargar}>
                Refrescar
              </CallToActionButton>
              <CallToActionButton
                type="button"
                handleSubmit={generarPdf}
                disabled={generandoPdf}
                className="whitespace-nowrap"
              >
                {generandoPdf ? "Generando..." : "Generar PDF"}
              </CallToActionButton>
            </div>
          </section>

          <section className="w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 overflow-x-auto">
            {vehiculosFiltrados.length === 0 ? (
              <p className="text-center text-cerulean-600 font-bold">
                No se encontraron vehículos
              </p>
            ) : (
              <VehiculosTable
                vehiculos={vehiculosFiltrados}
                onEditar={setVehiculoAEditar}
                onVerMas={setVehiculoDetalle}
                onDeleted={recargar}
              />
            )}
          </section>

          {vehiculoAEditar && (
            <EditarVehiculoModal
              key={vehiculoAEditar.id ?? vehiculoAEditar.patente}
              open
              vehiculo={vehiculoAEditar}
              onClose={() => setVehiculoAEditar(null)}
              onSuccess={recargar}
            />
          )}

          {vehiculoDetalle && (
            <VehiculoDetalleModal
              key={vehiculoDetalle.id ?? vehiculoDetalle.patente}
              open
              vehiculo={vehiculoDetalle}
              onClose={() => setVehiculoDetalle(null)}
            />
          )}
        </main>
      </MainLayout>
    </PageLayout>
  );
}

/**
 * Pantalla `/vehiculos`. Si el usuario es un playero con turno de barrera
 * activo (y no llegó con filtros por URL) se muestra su home; en cualquier
 * otro caso, la tabla de vehículos.
 */
export default function VehiculosPage() {
  const { usuario, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const esPlayero = usuario?.rol === "PLAYERO";
  const tieneFiltrosUrl =
    searchParams.has("estado") || searchParams.has("sucursal");

  const [turno, setTurno] = useState<Turno_Barrera | null>(null);
  const [cargandoTurno, setCargandoTurno] = useState(esPlayero);

  useEffect(() => {
    if (!esPlayero || !token || tieneFiltrosUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCargandoTurno(false);
      return;
    }

    let activo = true;

    const cargarTurno = async () => {
      setCargandoTurno(true);
      try {
        const res = await obtenerMiTurnoBarrera(token);
        if (activo) setTurno(res.data ?? null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (activo) {
          dispatch(
            showError(
              error.response?.data?.message ||
                "No se pudo cargar el turno de barrera.",
            ),
          );
        }
      } finally {
        if (activo) setCargandoTurno(false);
      }
    };

    cargarTurno();

    return () => {
      activo = false;
    };
  }, [esPlayero, token, tieneFiltrosUrl, dispatch]);

  if (esPlayero && !tieneFiltrosUrl) {
    if (cargandoTurno) {
      return (
        <PageLayout>
          <MainLayout>
            <main className="flex flex-col justify-start items-center py-4 px-4 w-full">
              <p className="text-sm text-cerulean-700 mt-4">Cargando...</p>
            </main>
          </MainLayout>
        </PageLayout>
      );
    }

    if (turno) {
      return <PlayeroHome turno={turno} />;
    }
  }

  return <VehiculosTabla />;
}
