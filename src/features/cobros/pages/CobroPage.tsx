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
import { formatDateFullWithHs } from "../../../app/hooks/dataParse";
import { formatCurrency, redondearImporte } from "../../../app/utils/money";
import type { Acarreo } from "../../../types/Acarreo";
import { obtenerAcarreosPorPatente } from "../../vehiculos/services/vehiculosService";
import {
  crearCobro,
  obtenerPreviewCobro,
  type PreviewCobro,
} from "../services/cobrosService";

/**
 * Formulario de cobro del cajero: se llega desde el buscador por patente
 * (acción "Cobrar" de un vehículo INGRESADO). El total lo calcula el servidor a
 * partir de la tarifa vigente y de las **estadías automáticas por reloj** (una
 * cada 12 horas desde el acarreo, con tope de 70): el cajero sólo reparte el
 * pago entre efectivo y Mercado Pago. Registra el cobro y vuelve al home.
 */
export default function CobroPage() {
  const { patente = "" } = useParams();
  const { token, usuario } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [acarreo, setAcarreo] = useState<Acarreo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [preview, setPreview] = useState<PreviewCobro | null>(null);
  const [cargandoPreview, setCargandoPreview] = useState(false);
  const [errorPreview, setErrorPreview] = useState<string | null>(null);
  // Al incrementarlo se vuelve a calcular el total (el reloj avanza).
  const [previewKey, setPreviewKey] = useState(0);

  const [efectivo, setEfectivo] = useState("");
  const [mp, setMp] = useState("");
  const [numeroFactura, setNumeroFactura] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // 1) El acarreo INGRESADO de la patente buscada.
  useEffect(() => {
    let activo = true;

    const cargarAcarreo = async () => {
      if (!token || !patente) {
        setCargando(false);
        return;
      }

      setCargando(true);

      try {
        const res = await obtenerAcarreosPorPatente(token, patente);
        if (!activo) return;

        const ingresado = (res.data as Acarreo[]).find(
          (a) => a.estado === "INGRESADO",
        );

        setAcarreo(ingresado ?? null);
        setErrorCarga(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (!activo) return;
        setErrorCarga(
          err.response?.data?.message ||
            "No se pudo cargar el vehículo. Intentá nuevamente más tarde.",
        );
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarAcarreo();

    return () => {
      activo = false;
    };
  }, [token, patente]);

  // 2) El total del cobro lo calcula el servidor (tarifa vigente + estadías).
  useEffect(() => {
    let activo = true;
    const idAcarreo = acarreo?.id;

    const cargarPreview = async () => {
      if (!token || !idAcarreo) {
        setPreview(null);
        return;
      }

      setCargandoPreview(true);

      try {
        const res = await obtenerPreviewCobro(token, idAcarreo);
        if (!activo) return;
        setPreview(res.data as PreviewCobro);
        setErrorPreview(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (!activo) return;
        setErrorPreview(
          err.response?.data?.message ||
            "No se pudo calcular el total. Intentá nuevamente.",
        );
      } finally {
        if (activo) setCargandoPreview(false);
      }
    };

    cargarPreview();

    return () => {
      activo = false;
    };
  }, [acarreo, token, previewKey]);

  const tarifa = preview?.tarifa ?? null;
  const estadias = preview?.estadias ?? 0;
  const total = preview?.total ?? 0;

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

  // El servidor exige un turno de caja abierto para registrar el cobro: sin
  // turno, la pantalla ni siquiera muestra el formulario.
  if (!usuario.Turno_Caja) {
    return (
      <PageLayout>
        <MainLayout>
          <aside className="w-full p-4 text-sm">
            <BreadcrumbsMenu
              page="Registrar cobro"
              links={[{ name: "Cajero", href: "/cajeros" }]}
            />
          </aside>

          <main className="flex flex-col justify-start items-center py-4 px-4 w-full">
            <section className="w-full max-w-2xl flex flex-col gap-4">
              <h1 className="text-lg font-bold uppercase">Registrar cobro</h1>

              <div className="bg-cerulean-200 rounded-lg p-4 flex flex-col gap-3">
                <p className="text-xs text-cerulean-900">
                  Para registrar un cobro necesitás tener un turno de caja
                  abierto. Abrí tu turno desde el inicio y volvé a intentarlo.
                </p>
                <div>
                  <CallToActionButton
                    type="button"
                    handleSubmit={() => navigate("/cajeros")}
                  >
                    Ir al inicio
                  </CallToActionButton>
                </div>
              </div>
            </section>
          </main>
        </MainLayout>
      </PageLayout>
    );
  }

  const volver = () => navigate("/cajeros");
  const recalcular = () => setPreviewKey((n) => n + 1);

  const handleSubmit = async () => {
    if (!acarreo || !tarifa) return;

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
        efectivo: e,
        mp: m,
        numero_factura:
          numeroFactura.trim() === "" ? null : numeroFactura.trim(),
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
      // El total pudo cambiar (el reloj avanza): se recalcula.
      recalcular();
    } finally {
      setEnviando(false);
    }
  };

  const vehiculo = acarreo?.Vehiculo ?? null;
  const fechaAcarreo = preview?.fecha_acarreo ?? acarreo?.fecha_acarreo ?? null;

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
                  <p className="mt-1 text-xs text-cerulean-800">
                    <span className="font-semibold">
                      Fecha y hora del acarreo:
                    </span>{" "}
                    {fechaAcarreo
                      ? formatDateFullWithHs(fechaAcarreo)
                      : "Sin registrar"}
                  </p>
                </div>

                {cargandoPreview && (
                  <p className="text-sm text-cerulean-700">
                    Calculando el total...
                  </p>
                )}

                {!cargandoPreview && errorPreview && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-scarlet-rush-700">
                      {errorPreview}
                    </p>
                    <div>
                      <CallToActionButton type="button" handleSubmit={recalcular}>
                        Recalcular
                      </CallToActionButton>
                    </div>
                  </div>
                )}

                {!cargandoPreview && !errorPreview && !tarifa && (
                  <p className="text-xs text-scarlet-rush-700">
                    No hay una tarifa vigente configurada: no se puede calcular
                    el cobro. Comunicate con Sistemas.
                  </p>
                )}

                {!cargandoPreview && !errorPreview && tarifa && preview && (
                  <>
                    <div className="rounded-lg bg-cerulean-200 p-3 text-xs text-cerulean-900 flex flex-col gap-1">
                      <p className="font-bold uppercase">Tarifa vigente</p>
                      <p>
                        Acarreo {formatCurrency(tarifa.acarreo)} + estadía{" "}
                        {formatCurrency(tarifa.estadia)} cada{" "}
                        {preview.horas_por_estadia} horas
                      </p>
                      <p className="text-cerulean-700">
                        Las estadías se calculan solas: se cobra una cada{" "}
                        {preview.horas_por_estadia} horas desde el acarreo (hasta{" "}
                        {preview.max_estadias}).
                      </p>
                    </div>

                    <div className="flex flex-col gap-1 bg-cerulean-200 rounded-lg p-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-cerulean-800">
                          Acarreo {formatCurrency(tarifa.acarreo)} +{" "}
                          {formatCurrency(tarifa.estadia)} × {estadias}
                        </span>
                        <span className="font-semibold text-cerulean-900">
                          Estadías: {estadias}
                          {preview.tope_estadias ? " (máximo)" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold uppercase">
                          Total
                        </span>
                        <span className="text-sm font-bold uppercase">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                      <label className="flex flex-col gap-1 text-xs font-bold uppercase sm:col-span-2">
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
                    </div>

                    <div className="flex justify-between items-center text-xs bg-cerulean-200 rounded-lg p-3">
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
