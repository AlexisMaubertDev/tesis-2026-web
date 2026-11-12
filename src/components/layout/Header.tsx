import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../app/store/authSlice";
import { logoutRequest } from "../../features/auth/services/authService";
import { useState } from "react";
import ChoiceModal from "../ui/ChoiceModal";

export default function Header() {
  const { usuario, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { browserOnline, apiStatus } = useSelector(
    (state: RootState) => state.offline,
  );
  const [cerrarAbierto, setCerrarAbierto] = useState(false);
  const [salirAbierto, setSalirAbierto] = useState(false);

  const handleExit = () => {
    dispatch(logout());
    navigate("/");
  };
  const handleLogout = async () => {
    try {
      await logoutRequest(token!);
    } catch (error) {
      // Si el token ya no vale, el interceptor de `api` cierra la sesión y
      // avisa. Ante cualquier otro error (por ejemplo, red caída) igual se
      // cierra en el cliente: no tiene sentido dejar al usuario atrapado
      // dentro de la app por un fallo del servidor.
      console.error(error);
    } finally {
      dispatch(logout());
    }
  };

  return (
    <>
      <header className="h-16 bg-cerulean-600 w-full px-4">
        <div className="flex items-center justify-between h-full max-w-5xl mx-auto gap-4">
          <h1 className="font-bold text-slate-100">ParkControl</h1>
          <nav className="flex gap-4 text-xs">
            {browserOnline && apiStatus !== "down" && (
              <>
                <Link
                  to="/acerca-de"
                  className="text-slate-100 hover:text-cerulean-300 transition-colors duration-300"
                >
                  {usuario!.nombre + " " + usuario!.apellido}
                </Link>
                <button
                  className="text-slate-100 hover:text-cerulean-300 transition-colors duration-300 cursor-pointer"
                  onClick={() => setCerrarAbierto(true)}
                >
                  Cerrar sesión
                </button>
              </>
            )}
            {browserOnline && apiStatus === "down" && (
              <>
                <Link
                  to="/acerca-de"
                  className="text-slate-100 hover:text-cerulean-300 transition-colors duration-300"
                >
                  {usuario!.nombre}
                </Link>
                <button
                  className="text-slate-100 hover:text-cerulean-300 transition-colors duration-300 cursor-pointer"
                  onClick={() => setSalirAbierto(true)}
                >
                  Salir
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Confirmación antes de cerrar sesión: evita cierres por toque
          accidental y avisa que la cola pendiente se mantiene en el
          dispositivo. */}
      <ChoiceModal
        open={cerrarAbierto}
        setOpen={setCerrarAbierto}
        title="¿Cerrar sesión?"
        subtitle="Vas a salir de tu cuenta. Las operaciones pendientes quedan guardadas en el dispositivo y se sincronizan cuando vuelvas a iniciar sesión."
        disabled={false}
        cancel={() => setCerrarAbierto(false)}
        confirm={() => {
          setCerrarAbierto(false);
          void handleLogout();
        }}
      />

      <ChoiceModal
        open={salirAbierto}
        setOpen={setSalirAbierto}
        title="¿Salir del sistema?"
        subtitle="Vas a salir de tu cuenta. Las operaciones pendientes quedan guardadas en el dispositivo."
        disabled={false}
        cancel={() => setSalirAbierto(false)}
        confirm={() => {
          setSalirAbierto(false);
          handleExit();
        }}
      />
    </>
  );
}
