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
import type { Acarreo } from "../../../types/Acarreo";
import { obtenerAcarreosPorPatente } from "../../vehiculos/services/vehiculosService";
import { crearCobro } from "../services/cobrosService";

/**
 * Formulario de cobro del cajero: se llega desde el buscador por patente
 * (acción "Cobrar" de un vehículo INGRESADO). Registra el cobro y vuelve al
 * home del cajero.
 */
export default function CobroPage() {
  const { patente = "" } = useParams();
  const { token, usuario } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [acarreo, setAcarreo] = useState<Acarreo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

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

  // El total se calcula como la suma de los medios de pago (efectivo + MP).
  const total = useMemo(() => {
    const e = Number(efectivo || 0);
    const m = Number(mp || 0);
    const suma = (Number.isFinite(e) ? e : 0) + (Number.isFinite(m) ? m : 0);
    return Math.round(suma * 100) / 100;
  }, [efectivo, mp]);

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!["CAJERO", "SUPERVISOR", "SISTEMAS"].includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  const volver = () => navigate("/cajeros");

  const handleSubmit = async () => {
    if (!acarreo) return;

    const e = Number(efectivo || 0);
    const m = Number(mp || 0);

    if (!Number.isFinite(e) || !Number.isFinite(m) || e < 0 || m < 0) {
      setErrorForm("Los importes deben ser números mayores o iguales a cero.");
      return;
    }

    if (total <= 0) {
      setErrorForm("El total del cobro debe ser mayor a cero.");
      return;
    }

    if (
      estadias !== "" &&
      (!Number.isInteger(Number(estadias)) || Number(estadias) < 0)
    ) {
      setErrorForm("Las estadías deben ser un número entero mayor o igual a cero.");
      return;
    }

    setEnviando(true);
    setErrorForm(null);

    try {
      await crearCobro(token!, {
        id_acarreo: acarreo.id,
        estadias: estadias === "" ? null : Number(estadias),
        total,
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

            {acarreo && (
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

                <div className="flex justify-between items-center bg-cerulean-200 rounded-lg p-3">
                  <span className="text-sm font-bold uppercase">Total</span>
                  <span className="text-lg font-bold text-cerulean-900">
                    ${total.toFixed(2)}
                  </span>
                </div>

                {errorForm && (
                  <p className="text-xs text-red-900">{errorForm}</p>
                )}

                <div className="flex gap-2 justify-end">
                  <CallToActionButton
                    type="button"
                    handleSubmit={volver}
                    disabled={enviando}
                  >
                    Cancelar
                  </CallToActionButton>
                  <CallToActionButton
                    type="button"
                    handleSubmit={handleSubmit}
                    disabled={enviando}
                  >
                    {enviando ? "Registrando..." : "Registrar cobro"}
                  </CallToActionButton>
                </div>
              </div>
            )}
          </section>
        </main>
      </MainLayout>
    </PageLayout>
  );
}
