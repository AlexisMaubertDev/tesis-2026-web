import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import PageLayout from "../../../components/layout/PageLayout";
import MainLayout from "../../../components/layout/MainLayout";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import { showInfo, showSuccess } from "../../../app/store/snackbarSlice";
import { escribir, estaEncolada } from "../../../app/offline/writes";

/**
 * Sección "sin conexión" (modo invitado): sólo lo operativo — cobrar,
 * ingresar y dar salida. Se entra desde el login cuando el servidor no
 * responde; el operador no carga credenciales (es un invitado) y todo queda
 * encolado a nombre de `invitado` hasta que, con el sistema de vuelta,
 * inicie sesión con su usuario real para sincronizar.
 */
export default function SinConexionPage() {
  const { usuario } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [patente, setPatente] = useState("");
  const [procesando, setProcesando] = useState(false);

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  const esCajero = usuario.rol === "CAJERO" || usuario.rol === "SUPERVISOR";
  const esPlayero = usuario.rol === "PLAYERO";
  const esGruero = usuario.rol === "GRUERO";

  const patenteLimpia = () => patente.trim().toUpperCase();

  const irACobrar = () => {
    const p = patenteLimpia();
    if (!esCajero || !p) return;
    navigate(`/cajeros/cobrar/${encodeURIComponent(p)}`);
  };

  /**
   * Encola un ingreso/egreso resuelto por patente: el `:acarreoId` se
   * completa al sincronizar (el invitado no tiene cache ni id local).
   */
  const accionPlayero = async (tipo: "INGRESO" | "EGRESO"): Promise<void> => {
    const p = patenteLimpia();
    if (!esPlayero || !p) return;

    setProcesando(true);
    try {
      const respuesta = await escribir(
        {
          tipo,
          metodo: "PUT",
          ruta: `/acarreos/:acarreoId/${tipo === "INGRESO" ? "ingresar" : "egresar"}`,
          body: {},
          recurso: {
            tipo: "ACARREO",
            patente: p,
            estadoRequerido: tipo === "INGRESO" ? "ACARREADO" : "COBRADO",
            id: null,
          },
        },
        // El invitado nunca llega a la llamada online (escribir encola
        // siempre); esta función es sólo para complimir los tipos.
        async () => {
          throw new Error("Sin conexión: operación guardada en el dispositivo");
        },
      );

      if (estaEncolada(respuesta)) {
        dispatch(
          showSuccess(
            `${tipo === "INGRESO" ? "Ingreso" : "Salida"} de ${p} guardado: se enviará cuando vuelva el sistema.`,
          ),
        );
        setPatente("");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      dispatch(showInfo(error?.message ?? "No se pudo guardar la operación."));
    } finally {
      setProcesando(false);
    }
  };

  return (
    <PageLayout>
      <MainLayout>
        <main className="flex flex-col items-center gap-4 py-6 px-4 w-full">
          <h1 className="text-lg font-bold uppercase">Sin conexión</h1>
          <p className="text-xs text-cerulean-900 text-center max-w-full my-4">
            Operando como {usuario.rol.toLowerCase()} invitado. Todo queda
            guardado en el dispositivo; cuando el sistema vuelva, ingresá tus
            credenciales para sincronizar lo cargado.
          </p>

          <section className="w-full max-w-2xl bg-cerulean-100 rounded-lg p-4 flex flex-col gap-3">
            <label
              htmlFor="patente-sin-conexion"
              className="text-sm font-bold uppercase"
            >
              Patente
            </label>
            <input
              id="patente-sin-conexion"
              className="w-full p-3 border border-cerulean-700 rounded-lg bg-cerulean-50 text-xs uppercase focus-visible:outline-2 focus-visible:outline-cerulean-500"
              type="text"
              placeholder="Ingresar patente"
              value={patente}
              onChange={(e) => setPatente(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter" && esCajero) irACobrar();
              }}
            />

            {esPlayero && (
              <div className="flex flex-wrap gap-2 justify-center">
                <CallToActionButton
                  type="button"
                  disabled={procesando || !patenteLimpia()}
                  handleSubmit={() => void accionPlayero("INGRESO")}
                >
                  Ingresar a la playa
                </CallToActionButton>
                <CallToActionButton
                  type="button"
                  disabled={procesando || !patenteLimpia()}
                  handleSubmit={() => void accionPlayero("EGRESO")}
                >
                  Dar salida
                </CallToActionButton>
              </div>
            )}
          </section>

          <div className="flex gap-2 flex-wrap justify-center">
            {esCajero && (
              <CallToActionButton
                type="button"
                disabled={!patenteLimpia()}
                handleSubmit={irACobrar}
              >
                Cobrar
              </CallToActionButton>
            )}
            {esGruero && (
              <p className="text-xs text-cerulean-900 max-w-96 text-center">
                El alta de acarreo se hace desde la app del gruero (celular); en
                la web no está disponible.
              </p>
            )}
            <CallToActionButton
              type="button"
              handleSubmit={() => navigate("/offline")}
            >
              Ver cola del dispositivo
            </CallToActionButton>
          </div>
        </main>
      </MainLayout>
    </PageLayout>
  );
}
