import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import PageLayout from "../../../components/layout/PageLayout";
import BreadcrumbsMenu from "../../../components/ui/BreadcrumbsMenu";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import ChoiceModal from "../../../components/ui/ChoiceModal";
import type { RootState } from "../../../app/store";
import { showError, showSuccess } from "../../../app/store/snackbarSlice";
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import { getTurnoLabel } from "../../../app/constants/turnos";
import type { Turno_Barrera } from "../../../types/Barrera";
import type { Vehiculo } from "../../../types/Vehiculo";
import {
  egresarAcarreo,
  ingresarAcarreoAPlaya,
  obtenerVehiculos,
} from "../services/vehiculosService";

type Accion = { tipo: "ingresar" | "egresar"; vehiculo: Vehiculo };

type TablaProps = {
  vehiculos: Vehiculo[];
  accionLabel: string;
  onAccion: (vehiculo: Vehiculo) => void;
  vacio: string;
  /** La tabla de acarreados muestra la fecha y hora del acarreo. */
  mostrarFecha?: boolean;
};

/** Tabla de vehículos de la sucursal con una única acción por fila. */
function TablaAcciones({
  vehiculos,
  accionLabel,
  onAccion,
  vacio,
  mostrarFecha = false,
}: TablaProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full table border-collapse">
        <thead className="bg-cerulean-600 text-white text-left">
          <tr className="text-sm border-b border-cerulean-400">
            <th className="border-r px-2 py-2 border-cerulean-400">Patente</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Marca</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Modelo</th>
            <th className="border-r px-2 py-2 border-cerulean-400">Color</th>
            {mostrarFecha && (
              <th className="border-r px-2 py-2 border-cerulean-400">
                Fecha y hora
              </th>
            )}
            <th className="px-2 py-2 border-cerulean-400">Acciones</th>
          </tr>
        </thead>

        <tbody className="bg-cerulean-50 text-xs">
          {vehiculos.length === 0 ? (
            <tr>
              <td
                colSpan={mostrarFecha ? 6 : 5}
                className="px-2 py-4 text-center text-cerulean-700 font-bold"
              >
                {vacio}
              </td>
            </tr>
          ) : (
            vehiculos.map((vehiculo) => (
              <tr key={vehiculo.id ?? vehiculo.patente}>
                <td className="border-r border-b border-cerulean-200 px-2 py-2">
                  {vehiculo.patente}
                </td>
                <td className="border-r border-b border-cerulean-200 px-2 py-2">
                  {vehiculo.marca}
                </td>
                <td className="border-r border-b border-cerulean-200 px-2 py-2">
                  {vehiculo.modelo}
                </td>
                <td className="border-r border-b border-cerulean-200 px-2 py-2">
                  {vehiculo.color}
                </td>
                {mostrarFecha && (
                  <td className="border-r border-b border-cerulean-200 px-2 py-2 text-nowrap">
                    {vehiculo.ultimo_acarreo
                      ? formatDateFullWithHs(vehiculo.ultimo_acarreo)
                      : "-"}
                  </td>
                )}
                <td className="border-b border-cerulean-200 px-2 py-2">
                  <CallToActionButton
                    type="button"
                    handleSubmit={() => onAccion(vehiculo)}
                  >
                    {accionLabel}
                  </CallToActionButton>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Home del playero cuando tiene un turno de barrera activo. Muestra los datos
 * del turno y dos tablas: los vehículos acarreados de su sucursal (pendientes
 * de ingreso a la playa) y los abonados (listos para dar salida).
 */
export default function PlayeroHome({ turno }: { turno: Turno_Barrera }) {
  const { token, usuario } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [accion, setAccion] = useState<Accion | null>(null);
  const [procesando, setProcesando] = useState(false);

  const recargar = () => setRefreshKey((k) => k + 1);

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

  // Sólo se muestran los vehículos de la sucursal del playero (la sucursal
  // del último acarreo).
  const idSucursal = usuario?.Sucursal?.id;
  const deMiSucursal = (vehiculo: Vehiculo) =>
    !!idSucursal && vehiculo.Sucursal?.id === idSucursal;

  const acarreados = vehiculos.filter(
    (v) => deMiSucursal(v) && v.ultimo_acarreo_estado === "ACARREADO",
  );
  const abonados = vehiculos.filter(
    (v) => deMiSucursal(v) && v.ultimo_acarreo_estado === "COBRADO",
  );

  const ubicacion = turno.Barrera?.ubicacion ?? "-";
  const sucursalNombre =
    turno.Barrera?.Sucursal?.nombre ?? usuario?.Sucursal?.nombre ?? "";

  const verVehiculosEnPlaya = () =>
    navigate(
      `/vehiculos?estado=INGRESADO&sucursal=${encodeURIComponent(sucursalNombre)}`,
    );

  const confirmarAccion = async () => {
    const acarreoId = accion?.vehiculo.ultimo_acarreo_id;

    if (!accion || !acarreoId) {
      setAccion(null);
      dispatch(
        showError(
          "No se pudo identificar el acarreo. Intenta nuevamente más tarde.",
        ),
      );
      return;
    }

    setProcesando(true);

    try {
      if (accion.tipo === "ingresar") {
        await ingresarAcarreoAPlaya(token!, acarreoId);
        dispatch(showSuccess("Vehículo ingresado a la playa con éxito"));
      } else {
        await egresarAcarreo(token!, acarreoId);
        dispatch(showSuccess("Vehículo egresado de la playa con éxito"));
      }
      recargar();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      dispatch(
        showError(
          error.response?.data?.message ||
            "No se pudo completar la acción. Intenta nuevamente más tarde.",
        ),
      );
    } finally {
      setProcesando(false);
      setAccion(null);
    }
  };

  return (
    <PageLayout>
      <MainLayout>
        <aside className="w-full p-4 text-sm">
          <BreadcrumbsMenu page="Vehiculos" />
        </aside>

        <main className="flex flex-col justify-start items-center py-4 px-4 w-full">
          <section className="flex flex-col sm:flex-row justify-between items-start lg:items-center w-full max-w-6xl bg-cerulean-100 rounded shadow p-4 mt-4 gap-4">
            <div>
              <h1 className="sm:text-lg font-bold uppercase">
                Barrera: {ubicacion}
              </h1>
              <h2 className="text-sm">Turno: {getTurnoLabel(turno.turno)}</h2>
              <span className="text-sm text-nowrap">
                Sucursal: {sucursalNombre}
              </span>
            </div>
            <CallToActionButton type="button" handleSubmit={verVehiculosEnPlaya}>
              Ver vehículos en playa
            </CallToActionButton>
          </section>

          <section className="w-full max-w-6xl flex justify-end mt-2">
            <CallToActionButton
              type="button"
              handleSubmit={() => {
                window.location.href = "/informes";
              }}
            >
              Ver informes
            </CallToActionButton>
          </section>

          <section className="flex flex-col w-full max-w-6xl gap-4 mt-4">
            <div className="bg-cerulean-100 rounded shadow p-4">
              <h2 className="sm:text-lg font-bold uppercase mb-2">
                Vehículos acarreados
              </h2>
              <TablaAcciones
                vehiculos={acarreados}
                mostrarFecha
                accionLabel="Ingresar a la playa"
                onAccion={(vehiculo) => setAccion({ tipo: "ingresar", vehiculo })}
                vacio="No hay vehículos pendientes de ingreso a la playa"
              />
            </div>

            <div className="bg-cerulean-100 rounded shadow p-4">
              <h2 className="sm:text-lg font-bold uppercase mb-2">
                Vehículos abonados
              </h2>
              <TablaAcciones
                vehiculos={abonados}
                accionLabel="Dar salida"
                onAccion={(vehiculo) => setAccion({ tipo: "egresar", vehiculo })}
                vacio="No hay vehículos abonados para dar salida"
              />
            </div>
          </section>
        </main>

        <ChoiceModal
          open={accion !== null}
          setOpen={(open) => {
            if (!open) setAccion(null);
          }}
          title={
            accion?.tipo === "ingresar"
              ? `¿Ingresar el vehículo ${accion?.vehiculo.patente ?? ""} a la playa?`
              : `¿Dar salida al vehículo ${accion?.vehiculo.patente ?? ""}?`
          }
          subtitle={
            accion?.tipo === "ingresar"
              ? "Se registrará el ingreso del vehículo a la playa."
              : "Se registrará el egreso del vehículo de la playa."
          }
          disabled={procesando}
          confirm={confirmarAccion}
          cancel={() => setAccion(null)}
        />
      </MainLayout>
    </PageLayout>
  );
}
