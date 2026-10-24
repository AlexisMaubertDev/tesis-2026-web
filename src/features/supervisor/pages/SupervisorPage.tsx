import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import PageLayout from "../../../components/layout/PageLayout";
import MainLayout from "../../../components/layout/MainLayout";
import type { RootState } from "../../../app/store";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import { useCallback, useEffect, useState } from "react";
import type { Caja } from "../../../types/Caja";
import type { Grua } from "../../../types/Grua";
import type { Barrera } from "../../../types/Barrera";
import { obtenerCajasSucursal } from "../../cajas/services/cajasService";
import {
  finalizarTurnosSucursal,
  obtenerGruasSucursal,
} from "../../gruas/services/gruasServices";
import { obtenerBarrerasSucursal, finalizarTodosTurnosBarrera } from "../../barreras/services/barrerasService";
import BuscarVehiculoPatente from "../../vehiculos/components/BuscarVehiculoPatente";

import CircleIcon from "@mui/icons-material/Circle";
import { Tooltip } from "@mui/material";
import AsignarGruaModal from "../components/AsignarGruaModal";
import VerDetalleModal from "../components/VerDetalleModal";
import VerDetalleCajaModal from "../components/VerDetalleCajaModal";
import AsignarBarreraModal from "../../barreras/components/AsignarBarreraModal";
import VerDetalleBarreraModal from "../../barreras/components/VerDetalleBarreraModal";
import ChoiceModal from "../../../components/ui/ChoiceModal";
import { showError, showSuccess } from "../../../app/store/snackbarSlice";
import { abrirPestanias, cerrarPestanias } from "../../../app/utils/pestanias";
import { abrirInformeTurnoBarrera } from "../../barreras/services/turnosBarreraService";
import { abrirInformeTurnoGrua } from "../../gruas/services/turnosGruaService";

const ESTADOS = {
  EN_SERVICIO: "En servicio",
  FUERA_DE_SERVICIO: "Fuera de servicio",
  DISPONIBLE: "Disponible",
  MANTENIMIENTO: "Mantenimiento",
};

const ESTADOS_GRUA = {
  DISPONIBLE: { color: "text-blue-500" },
  EN_SERVICIO: { color: "text-green-500" },
  MANTENIMIENTO: { color: "text-amber-500" },
  FUERA_DE_SERVICIO: { color: "text-red-500" },
};

export default function SupervisorPage() {
  const { usuario, token } = useSelector((state: RootState) => state.auth);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [gruas, setGruas] = useState<Grua[]>([]);
  const [barreras, setBarreras] = useState<Barrera[]>([]);

  const [asignarModal, setAsignarModal] = useState<Grua | null>(null);
  const [verDetalleModal, setVerDetalleModal] = useState<Grua | null>(null);
  const [detalleCaja, setDetalleCaja] = useState<Caja | null>(null);
  const [finalizar, setFinalizar] = useState<boolean>(false);

  const [asignarBarreraModal, setAsignarBarreraModal] = useState<Barrera | null>(null);
  const [verDetalleBarreraModal, setVerDetalleBarreraModal] = useState<Barrera | null>(null);
  const [finalizarBarreras, setFinalizarBarreras] = useState<boolean>(false);

  const dispatch = useDispatch();

  const refrescarDatos = useCallback(async () => {
    if (!token || !usuario?.Sucursal?.id) return;

    try {
      const [resCajas, resGruas, resBarreras] = await Promise.all([
        obtenerCajasSucursal(token, usuario.Sucursal.id),
        obtenerGruasSucursal(token, usuario.Sucursal.id),
        obtenerBarrerasSucursal(token, usuario.Sucursal.id),
      ]);
      setCajas(resCajas.data);
      setGruas(resGruas.data);
      setBarreras(resBarreras.data);
    } catch (error) {
      console.error(error);
    }
  }, [token, usuario]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refrescarDatos();
  }, [refrescarDatos]);

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (usuario.rol !== "SUPERVISOR") {
    return <Navigate to="/" replace />;
  }

  const finalizarTurno = async () => {
    // RF27: al cerrar los turnos de grúa se emite solo un informe por grúa. Las
    // pestañas se abren antes del pedido para no perder el gesto del usuario.
    const pestanias = abrirPestanias(
      gruas.filter((grua) => grua.turno_grua_activo).length,
    );

    try {
      const res = await finalizarTurnosSucursal(token!, usuario.Sucursal.id!);
      dispatch(showSuccess("Turnos finalizados con éxito"));
      await refrescarDatos(); // <--- RECARGA DATOS

      const turnos = res?.data?.turnos ?? [];

      const informes = await Promise.allSettled(
        turnos.map((turno, indice) =>
          abrirInformeTurnoGrua(
            token!,
            turno.id,
            pestanias[indice] ?? null,
            `informe-turno-grua-${turno.grua?.patente ?? turno.id}.pdf`,
          ),
        ),
      );

      if (informes.some((resultado) => resultado.status === "rejected")) {
        dispatch(showError("Algunos informes no se pudieron generar"));
      }

      cerrarPestanias(pestanias.slice(turnos.length));
    } catch (error) {
      cerrarPestanias(pestanias);
      console.error(error);
      dispatch(showError("Error al finalizar turnos"));
    } finally {
      setFinalizar(false);
    }
  };

  const finalizarTurnosBarrera = async () => {
    // RF15: al cerrar los turnos de barrera se emite solo un informe por
    // barrera. Las pestañas se abren antes del pedido (gesto del usuario).
    const pestanias = abrirPestanias(
      barreras.filter((barrera) => barrera.turno_barrera_activo).length,
    );

    try {
      const res = await finalizarTodosTurnosBarrera(token!, usuario.Sucursal.id!);
      dispatch(showSuccess("Turnos de barrera finalizados con éxito"));
      await refrescarDatos();

      const turnos = res?.data?.turnos ?? [];

      const informes = await Promise.allSettled(
        turnos.map((turno, indice) =>
          abrirInformeTurnoBarrera(
            token!,
            turno.id,
            pestanias[indice] ?? null,
            `informe-turno-barrera-${turno.barrera?.ubicacion ?? turno.id}.pdf`,
          ),
        ),
      );

      if (informes.some((resultado) => resultado.status === "rejected")) {
        dispatch(showError("Algunos informes no se pudieron generar"));
      }

      cerrarPestanias(pestanias.slice(turnos.length));
    } catch (error) {
      cerrarPestanias(pestanias);
      console.error(error);
      dispatch(showError("Error al finalizar turnos de barrera"));
    } finally {
      setFinalizarBarreras(false);
    }
  };

  return (
    <PageLayout>
      <MainLayout>
        <main className="flex flex-col justify-start items-center py-4 px-4">
          <section className="flex max-w-6xl flex-col sm:flex-row justify-between items-start lg:items-center w-full bg-cerulean-100 rounded shadow p-4 mt-4 mx-4 gap-4">
            <div>
              <h1 className="sm:text-lg font-bold uppercase self-center">
                {usuario.Sucursal.nombre}
              </h1>
              <span className="text-sm text-nowrap">
                {usuario.Sucursal.direccion}
              </span>
            </div>
            <ul className="flex w-full gap-2 sm:justify-end flex-wrap">
              <li>
                <CallToActionButton type="button">
                  <Link
                    to={`/supervisor/usuarios?sucursal=${usuario.Sucursal.nombre}`}
                  >
                    Usuarios
                  </Link>
                </CallToActionButton>
              </li>
              <li>
                <CallToActionButton type="button">
                  <Link
                    to={`/supervisor/cajas?sucursal=${usuario.Sucursal.nombre}`}
                  >
                    Cajas
                  </Link>
                </CallToActionButton>
              </li>
              <li>
                <CallToActionButton type="button">
                  <Link
                    to={`/supervisor/gruas?sucursal=${usuario.Sucursal.nombre}`}
                  >
                    Gruas
                  </Link>
                </CallToActionButton>
              </li>
              <li>
                <CallToActionButton type="button">
                  <Link
                    to={`/supervisor/barreras?sucursal=${usuario.Sucursal.nombre}`}
                  >
                    Barreras
                  </Link>
                </CallToActionButton>
              </li>
              <li>
                <CallToActionButton type="button">
                  <Link to="/informes">Informes</Link>
                </CallToActionButton>
              </li>
            </ul>
          </section>

          {/* BUSCAR VEHÍCULO */}
          <section className="flex flex-col max-w-6xl w-full mt-4 gap-4">
            <BuscarVehiculoPatente />
          </section>

          {/* CAJAS */}
          <section className="flex flex-col max-w-6xl justify-between items-start lg:items-center w-full mt-4 gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start lg:items-center w-full bg-cerulean-100 rounded shadow p-4 gap-4">
              <h1 className="sm:text-lg font-bold uppercase self-center">
                Cajas
              </h1>
            </div>
            <ul className="flex justify-start items-start lg:items-center w-full gap-4">
              {cajas.map((caja) => (
                <li
                  key={caja.id}
                  className="flex bg-cerulean-200 rounded shadow p-4 w-full sm:w-auto"
                >
                  <div className="flex flex-col gap-2">
                    <span className="font-bold">
                      Caja N°: {caja.numero_caja}
                    </span>
                    <p>
                      <span className="font-bold mr-1">Referencia:</span>
                      {caja.referencia}
                    </p>
                    <CallToActionButton
                      type="button"
                      handleSubmit={() => setDetalleCaja(caja)}
                    >
                      Ver detalle
                    </CallToActionButton>
                  </div>
                  <div className="-mr-2 -mt-2">
                    <Tooltip
                      title={caja.turno_caja_activo ? "Operando" : "Cerrada"}
                    >
                      <CircleIcon
                        className={
                          caja.turno_caja_activo
                            ? "text-green-500"
                            : "text-red-500"
                        }
                        fontSize="small"
                      />
                    </Tooltip>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* GRÚAS */}
          <section className="flex flex-col max-w-6xl justify-between items-start lg:items-center w-full mt-4 gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start lg:items-center w-full bg-cerulean-100 rounded shadow p-4 gap-4">
              <h1 className="sm:text-lg font-bold uppercase self-center">
                Grúas
              </h1>
              {gruas.some((grua) => grua.estado === "EN_SERVICIO") && (
                <CallToActionButton
                  type="button"
                  handleSubmit={() => setFinalizar(true)}
                >
                  Finalizar turnos
                </CallToActionButton>
              )}
            </div>
            <ul className="flex justify-start items-start lg:items-center w-full gap-4">
              {gruas.map((grua) => (
                <li
                  key={grua.id}
                  className="flex bg-cerulean-200 rounded shadow p-4 w-full sm:w-auto"
                >
                  <div className="flex flex-col gap-2">
                    <span className="font-bold">Grúa N°: {grua.numero}</span>
                    <p>
                      <span className="font-bold mr-1">Patente:</span>
                      {grua.patente}
                    </p>

                    {grua.estado === "DISPONIBLE" && (
                      <CallToActionButton
                        type="button"
                        handleSubmit={() => setAsignarModal(grua)}
                      >
                        Asignar
                      </CallToActionButton>
                    )}
                    {grua.estado === "EN_SERVICIO" && (
                      <CallToActionButton
                        type="button"
                        handleSubmit={() => setVerDetalleModal(grua)}
                      >
                        Ver detalle
                      </CallToActionButton>
                    )}
                  </div>
                  <div className="-mr-2 -mt-2">
                    <Tooltip title={ESTADOS[grua.estado]}>
                      <CircleIcon
                        className={ESTADOS_GRUA[grua.estado].color}
                        fontSize="small"
                      />
                    </Tooltip>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* BARRERAS */}
          <section className="flex flex-col max-w-6xl justify-between items-start lg:items-center w-full mt-4 gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start lg:items-center w-full bg-cerulean-100 rounded shadow p-4 gap-4">
              <h1 className="sm:text-lg font-bold uppercase self-center">
                Barreras
              </h1>
              {barreras.some((b) => b.turno_barrera_activo) && (
                <CallToActionButton
                  type="button"
                  handleSubmit={() => setFinalizarBarreras(true)}
                >
                  Finalizar turnos
                </CallToActionButton>
              )}
            </div>
            <ul className="flex justify-start items-start lg:items-center w-full gap-4 flex-wrap">
              {barreras.map((barrera) => (
                <li
                  key={barrera.id}
                  className="flex bg-cerulean-200 rounded shadow p-4 w-full sm:w-auto"
                >
                  <div className="flex flex-col gap-2">
                    <span className="font-bold">{barrera.ubicacion}</span>
                    <p>
                      <span className="font-bold mr-1">Sucursal:</span>
                      {barrera.Sucursal.nombre}
                    </p>
                    {barrera.turno_barrera_activo ? (
                      <CallToActionButton
                        type="button"
                        handleSubmit={() => setVerDetalleBarreraModal(barrera)}
                      >
                        Ver detalle
                      </CallToActionButton>
                    ) : (
                      <CallToActionButton
                        type="button"
                        handleSubmit={() => setAsignarBarreraModal(barrera)}
                      >
                        Asignar
                      </CallToActionButton>
                    )}
                  </div>
                  <div className="-mr-2 -mt-2">
                    <Tooltip
                      title={barrera.turno_barrera_activo ? "Operando" : "Disponible"}
                    >
                      <CircleIcon
                        className={
                          barrera.turno_barrera_activo
                            ? "text-green-500"
                            : "text-blue-500"
                        }
                        fontSize="small"
                      />
                    </Tooltip>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </main>

        {asignarModal && (
          <AsignarGruaModal
            open={asignarModal !== null}
            setOpen={(boolean) => {
              if (!boolean) setAsignarModal(null);
            }}
            grua={asignarModal}
            onSuccess={() => {
              setAsignarModal(null);
              refrescarDatos();
            }}
          />
        )}

        {verDetalleModal && (
          <VerDetalleModal
            open={verDetalleModal !== null}
            setOpen={(boolean) => {
              if (!boolean) setVerDetalleModal(null);
            }}
            grua={verDetalleModal}
            onSuccess={() => {
              setVerDetalleModal(null);
              refrescarDatos(); // <--- RECARGA DATOS TRAS ACCIÓN EN DETALLE
            }}
          />
        )}

        {detalleCaja && (
          <VerDetalleCajaModal
            open={detalleCaja !== null}
            setOpen={(boolean) => {
              if (!boolean) setDetalleCaja(null);
            }}
            caja={detalleCaja}
          />
        )}

        {asignarBarreraModal && (
          <AsignarBarreraModal
            open={asignarBarreraModal !== null}
            setOpen={(v: boolean) => {
              if (!v) setAsignarBarreraModal(null);
            }}
            barrera={asignarBarreraModal}
            onSuccess={() => {
              setAsignarBarreraModal(null);
              refrescarDatos();
            }}
          />
        )}

        {verDetalleBarreraModal && (
          <VerDetalleBarreraModal
            open={verDetalleBarreraModal !== null}
            setOpen={(v: boolean) => {
              if (!v) setVerDetalleBarreraModal(null);
            }}
            barrera={verDetalleBarreraModal}
            onSuccess={() => {
              setVerDetalleBarreraModal(null);
              refrescarDatos();
            }}
          />
        )}

        <ChoiceModal
          open={finalizarBarreras}
          setOpen={setFinalizarBarreras}
          title="Finalizar turnos de barrera de esta sucursal"
          subtitle="¿Desea finalizar los turnos?"
          disabled={false}
          confirm={finalizarTurnosBarrera}
          cancel={() => setFinalizarBarreras(false)}
        />

        <ChoiceModal
          open={finalizar}
          setOpen={setFinalizar}
          title="Finalizar turnos de esta sucursal"
          subtitle="¿Desea finalizar los turnos?"
          disabled={false}
          confirm={finalizarTurno}
          cancel={() => setFinalizar(false)}
        />
      </MainLayout>
    </PageLayout>
  );
}
