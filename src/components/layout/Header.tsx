import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { Link, Navigate } from "react-router-dom";
import { logout } from "../../app/store/authSlice";

export default function Header() {
  const { usuario } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return (
    <header className="h-16 bg-san-marino-400 w-full px-4">
      <div className="flex items-center justify-between h-full max-w-5xl mx-auto gap-4">
        <h1 className="text-xl font-bold text-san-marino-100">ParkControl</h1>
        <nav className="flex gap-4">
          <Link
            to="/acerca-de"
            className="text-san-marino-100 hover:text-san-marino-600 transition-colors duration-300"
          >
            {usuario.nombre + " " + usuario.apellido}
          </Link>
          {(usuario.rol === "CAJERO" || usuario.rol === "PLAYERO") && (
            <button
              className="text-san-marino-100 hover:text-san-marino-600 transition-colors duration-300 cursor-pointer"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
            >
              Empezar turno
            </button>
          )}
          {(usuario.rol === "CAJERO" || usuario.rol === "PLAYERO") && (
            <button
              className="text-san-marino-100 hover:text-san-marino-600 transition-colors duration-300 cursor-pointer"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
            >
              Terminar turno
            </button>
          )}
          {!(usuario.rol === "CAJERO" || usuario.rol === "PLAYERO") && (
            <button
              className="text-san-marino-100 hover:text-san-marino-600 transition-colors duration-300 cursor-pointer"
              onClick={() => {
                dispatch(logout());
              }}
            >
              Cerrar sesión
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
