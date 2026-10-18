import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import PageLayout from "../../../components/layout/PageLayout";
import MainLayout from "../../../components/layout/MainLayout";
import BreadcrumbsMenu from "../../../components/ui/BreadcrumbsMenu";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import TextInput from "../../../components/ui/TextInput";
import { showError, showSuccess } from "../../../app/store/snackbarSlice";
import { formatCurrency, redondearImporte } from "../../../app/utils/money";
import type { Acarreo } from "../../../types/Acarreo";
import type { Tarifa } from "../../../types/Tarifa";
import { obtenerAcarreosPorPatente } from "../../vehiculos/services/vehiculosService";
import { obtenerTarifaVigente } from "../../tarifas/services/tarifasService";
import { crearCobro } from "../services/cobrosService";

/**
 * Formulario de cobro del cajero: se llega desde el buscador por patente
 * (acción "Cobrar" de un vehículo INGRESADO). El total lo calcula la tarifa
 * vigente (acarreo + estadía × estadías) y el cajero lo reparte entre efectivo
 * y Mercado Pago. Registra el cobro y vuelve al home del cajero.
 */
export default function CobroPage() {
  const { patente = "" } = useParams();
  const { token, usuario } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [acarreo, setAcarreo] = useState<Acarreo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [tarifa, setTarifa] = useState<Tarifa | null>(null);
  const [cargandoTarifa, setCargandoTarifa] = useState(true);

  const [estadias, setEstadias] = useState("");
  const [efectivo, setEfectivo] = useState("");
  const [mp, setMp] = useState("");
  const [numeroFactura, setNumeroFactura] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !patente) return;

    let activo = true;

    const cargar = async () => {
      setCargando(true);
      setErrorCarga(null);

      try {
        const res = await obtenerAcarreosPorPatente(token, patente);
        const acarreos = res.data as Acarreo[];
        // El cobro aplica al acarreo que está en la playa (INGRESADO).
        const ingresado = acarreos.find((a) => a.estado === "INGRESADO") ?? null;
        if (activo) setAcarreo(ingresado);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (activo) {
          setErrorCarga(
            err.response?.data?.message ||
              "No se pudo cargar el vehículo. Intentá nuevamente más tarde.",
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [token, patente]);

  // La tarifa vigente define el importe automático del cobro.
  useEffect(() => {
    if (!token) return;

    let activo = true;

    const cargarTarifa = async () => {
      setCargandoTarifa(true);

      try {
        const res = await obtenerTarifaVigente(token);
        if (activo) setTarifa(res.data);
      } catch {
        if (activo) setTarifa(null);
      } finally {
        if (activo) setCargandoTarifa(false);
      }
    };

    cargarTarifa();

    return () => {
      activo = false;
    };
  }, [token]);

  const estadiasNum = estadias.trim() === "" ? 0 : Number(estadias);
  const estadiasValidas = Number.isInteger(estadiasNum) && estadiasNum >= 0;

  // Total automático: acarreo + estadía × cantidad de estadías.
  const total = useMemo(() => {
    if (!tarifa || !estadiasValidas) return 0;
    return redondearImporte(
      Number(tarifa.acarreo) + Number(tarifa.estadia) * estadiasNum,
    );
  }, [tarifa, estadiasNum, estadiasValidas]);

  const sumaPagos = useMemo(() => {
    const e = Number(efectivo || 0);
    const m = Number(mp || 0);
    const suma = (Number.isFinite(e) ? e : 0) + (Number.isFinite(m) ? m : 0);
    return redondearImporte(suma);
  }, [efectivo, mp]);

  const diferencia = redondearImporte(total - sumaPagos);

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!["CAJERO", "SUPERVISOR", "SISTEMAS"].includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  const volver = () => navigate("/cajeros");

  const handleSubmit = async () => {
    if (!acarreo) return;

    if (!tarifa) {
      setErrorForm(
        "No hay una tarifa vigente configurada. Comunicate con Sistemas.",
      );
      return;
    }

    if (!Number.isInteger(Number(estadias)) && estadias !== "") {
      setErrorForm("Las estadías deben ser un número entero mayor o igual a cero.");
      return;
    }

    const e = Number(efectivo || 0);
    const m = Number(mp || 0);

    if (!Number.isFinite(e) || !Number.isFinite(m) || e < 0 || m < 0) {
      setErrorForm("Los importes deben ser números mayores o iguales a cero.");
      return;
    }

    if (diferencia !== 0) {
      setErrorForm(
        `El total a abonar es ${formatCurrency(total)}: el efectivo y Mercado Pago deben sumar exactamente ese importe.`,
      );
      return;
    }

    setEnviando(true);
    setErrorForm(null);

    try {
      await crearCobro(token!, {
        id_acarreo: acarreo.id,
        estadias: estadias === "" ? 0 : Number(estadias),
        efectivo: e,
        mp: m,
        numero_factura: numeroFactura.trim() === "" ? null : numeroFactura.trim(),
      });

      dispatch(showSuccess("Cobro registrado con éxito"));
      volver();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "No se pudo registrar el cobro. Intentá nuevamente más tarde.";
      setErrorForm(message);
      dispatch(showError(message));
    } finally {
      setEnviando(false);
    }
  };

  const vehiculo = acarreo?.Vehiculo ?? null;

  return (
    <PageLayout>
      <MainLayout>
        <aside className="w-full p-4 text-sm">
          <BreadcrumbsMenu
            page={patente ? `Cobro ${patente}` : "Cobro"}
            links={[{ name: "Cajero", href: "/cajeros" }]}
          />
        </aside>

        <main className="flex flex-col justify-start items-center py-4 px-4 w-full">
          <section className="w-full max-w-2xl flex flex-col gap-4">
            <h1 className="text-lg font-bold uppercase">Registrar cobro</h1>

            {cargando && (
              <p className="text-sm text-cerulean-700">Cargando...</p>
            )}

            {!cargando && errorCarga && (
              <p className="text-sm text-scarlet-rush-700">{errorCarga}</p>
            )}

            {!cargando && !errorCarga && !acarreo && (
              <div className="bg-cerulean-200 rounded-lg p-4 flex flex-col gap-3">
                <p className="text-xs text-cerulean-900">
                  El vehículo {patente} no está ingresado en la playa, por lo
                  que no se puede cobrar.
                </p>
                <div>
                  <CallToActionButton type="button" handleSubmit={volver}>
                    Volver
                  </CallToActionButton>
                </div>
              </div>
            )}

            {!cargando && acarreo && (
              <div className="bg-cerulean-100 rounded shadow p-4 flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-bold text-cerulean-900">
                    {vehiculo?.patente ?? patente}
                  </h2>
                  <p className="text-xs text-cerulean-800">
                    {[vehiculo?.marca, vehiculo?.modelo, vehiculo?.color]
                      .filter(Boolean)
                      .join(" - ") || "Sin datos del vehículo"}
                  </p>
                </div>

                {cargandoTarifa ? (
                  <p className="text-sm text-cerulean-700">
                    Cargando tarifa...
                  </p>
                ) : !tarifa ? (
                  <p className="text-xs text-scarlet-rush-700">
                    No hay una tarifa vigente configurada: no se puede calcular
                    el cobro. Comunicate con Sistemas.
                  </p>
                ) : (
                  <>
                    <div className="rounded-lg bg-cerulean-200 p-3 text-xs text-cerulean-900">
                      <p className="font-bold uppercase">Tarifa vigente</p>
                      <p>
                        Acarreo {formatCurrency(tarifa.acarreo)} + estadía{" "}
                        {formatCurrency(tarifa.estadia)} por día
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1 text-xs font-bold uppercase">
                        Estadías (opcional)
                        <TextInput
                          value={estadias}
                          onChange={(e) => setEstadias(e.target.value)}
                          placeholder="Cantidad de estadías"
                          name="estadias"
                          type="number"
                          disabled={enviando}
                        />
                      </label>

                      <label className="flex flex-col gap-1 text-xs font-bold uppercase">
                        N° de factura (opcional)
                        <TextInput
                          value={numeroFactura}
                          onChange={(e) => setNumeroFactura(e.target.value)}
                          placeholder="Número de factura"
                          name="numero_factura"
                          type="text"
                          disabled={enviando}
                        />
                      </label>

                      <label className="flex flex-col gap-1 text-xs font-bold uppercase">
                        Efectivo
                        <TextInput
                          value={efectivo}
                          onChange={(e) => setEfectivo(e.target.value)}
                          placeholder="Monto en efectivo"
                          name="efectivo"
                          type="number"
                          disabled={enviando}
                        />
                      </label>

                      <label className="flex flex-col gap-1 text-xs font-bold uppercase">
                        Mercado Pago
                        <TextInput
                          value={mp}
                          onChange={(e) => setMp(e.target.value)}
                          placeholder="Monto por Mercado Pago"
                          name="mp"
                          type="number"
                          disabled={enviando}
                        />
                      </label>
                    </div>

                    <div className="flex flex-col gap-1 bg-cerulean-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-cerulean-800">
                          {tarifa
                            ? `${formatCurrency(tarifa.acarreo)} + ${formatCurrency(tarifa.estadia)} × ${estadias === "" ? 0 : estadias}`
                            : ""}
                        </span>
                        <span className="text-sm font-bold uppercase">
                          Total {formatCurrency(total)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-cerulean-800">
                          Efectivo + Mercado Pago
                        </span>
                        <span
                          className={
                            diferencia === 0
                              ? "text-emerald-700 font-bold"
                              : "text-scarlet-rush-700 font-bold"
                          }
                        >
                          {formatCurrency(sumaPagos)}
                        </span>
                      </div>
                      {diferencia !== 0 && (
                        <p className="text-xs text-scarlet-rush-700">
                          {diferencia > 0
                            ? `Faltan ${formatCurrency(diferencia)}`
                            : `Sobran ${formatCurrency(Math.abs(diferencia))}`}
                        </p>
                      )}
                    </div>

                    {errorForm && (
                      <p className="text-xs text-red-900">{errorForm}</p>
                    )}

                    <div className="flex justify-end gap-3">
                      <CallToActionButton
                        type="button"
                        handleSubmit={volver}
                        disabled={enviando}
                      >
                        Volver
                      </CallToActionButton>
                      <CallToActionButton
                        type="button"
                        handleSubmit={handleSubmit}
                        disabled={enviando || diferencia !== 0}
                      >
                        {enviando ? "Registrando..." : "Registrar cobro"}
                      </CallToActionButton>
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
        </main>
      </MainLayout>
    </PageLayout>
  );
}
