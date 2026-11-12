import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { loginRequest } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import PageLayout from "../../../components/layout/PageLayout";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import TextInput from "../../../components/ui/TextInput";
import { useDispatch, useSelector } from "react-redux";
import { clearSnackbar, showError } from "../../../app/store/snackbarSlice";
import { entrarSinSistema } from "../../../app/store/authSlice";
import type { RootState } from "../../../app/store";
import { clasificarError } from "../../../app/offline/errors";

/** Roles que pueden trabajar en la sección "sin conexión". */
const ROLES_SIN_SISTEMA = [
  { rol: "CAJERO" as const, etiqueta: "Cajero" },
  { rol: "PLAYERO" as const, etiqueta: "Playero" },
];

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ dni: null, password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [sinSistemaAbierto, setSinSistemaAbierto] = useState<boolean>(false);
  const { usuario, sessionExpired } = useSelector(
    (state: RootState) => state.auth,
  );
  const { browserOnline, apiStatus } = useSelector(
    (state: RootState) => state.offline,
  );
  const { login } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // El botón "Ingresar sin conexión" sólo aparece cuando el servidor no
  // responde (sin red o API caída).
  const sinSistemaVisible = !browserOnline || apiStatus === "down";

  // Con la sesión vencida se deja ver el login aunque haya un usuario
  // guardado: es la forma de reconectar sin perder la caché ni la outbox.
  if (usuario && !sessionExpired && apiStatus === "online") {
    return <Navigate to="/" />;
  }

  const entrarSinSistemaConRol = (
    rol: (typeof ROLES_SIN_SISTEMA)[number]["rol"],
  ) => {
    dispatch(clearSnackbar());
    dispatch(entrarSinSistema(rol));
    navigate("/sin-conexion");
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(clearSnackbar());

    if (credentials.dni === null || !credentials.password.trim()) {
      setCredentials({ dni: null, password: "" });
      dispatch(showError("Por favor, ingresa tu DNI y contraseña"));
      return;
    }

    setLoading(true);

    try {
      const data = await loginRequest({
        dni: credentials.dni,
        password: credentials.password.trim(),
      });
      login(data);
      navigate("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const sinRed = clasificarError(err) === "network";
      dispatch(
        showError(
          err.response?.data?.message ||
            (sinRed
              ? "No hay conexión con el servidor. Para iniciar sesión necesitás reconectarte."
              : "Error en el servidor. Intenta nuevamente más tarde."),
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <PageLayout>
      <section className="flex flex-col justify-between min-h-screen pb-2 pt-24">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 bg-cerulean-100 p-4 sm:p-8 rounded shadow-xl max-w-96 mx-4"
        >
          <h1 className=" font-bold text-center">Ingresar</h1>
          <p className="text-center text-xs">
            Por favor, ingresa tu DNI y contraseña
          </p>
          {sessionExpired && (
            <p className="text-center text-xs text-scarlet-rush-700 bg-scarlet-rush-100 rounded p-2">
              Tu sesión venció. Ingresá de nuevo para sincronizar los cambios
              pendientes; los datos guardados siguen disponibles.
            </p>
          )}
          <div className="flex flex-col gap-2">
            <TextInput
              type="number"
              placeholder="DNI"
              name="dni"
              value={credentials.dni || ""}
              onChange={handleChange}
            />

            <div className="relative">
              <TextInput
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Contraseña"
                value={credentials.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-cerulean-700 hover:text-cerulean-900 cursor-pointer"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                tabIndex={-1}
              >
                {showPassword ? (
                  <VisibilityOffIcon fontSize="small" />
                ) : (
                  <VisibilityIcon fontSize="small" />
                )}
              </button>
            </div>
          </div>
          <div className="flex w-full justify-center">
            <CallToActionButton type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </CallToActionButton>
          </div>

          {sinSistemaVisible && (
            <div className="flex flex-col gap-2 border-t border-cerulean-300 pt-3">
              <button
                type="button"
                onClick={() => setSinSistemaAbierto((v) => !v)}
                className="text-xs text-cerulean-800 underline underline-offset-2 cursor-pointer text-center"
              >
                Ingresar sin conexión
              </button>

              {sinSistemaAbierto && (
                <div className=" p-3 flex flex-col">
                  <div className="grid grid-cols-1 gap-2">
                    {ROLES_SIN_SISTEMA.map(({ rol, etiqueta }) => (
                      <CallToActionButton
                        key={rol}
                        type="button"
                        handleSubmit={() => entrarSinSistemaConRol(rol)}
                      >
                        {etiqueta}
                      </CallToActionButton>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </form>

        <p className="text-center text-cerulean-900 pb-32 sm:pb-20">
          Creado por <span className="font-bold">Alexis Maubert</span>
        </p>
      </section>
    </PageLayout>
  );
}
