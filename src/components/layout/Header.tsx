import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { Link, Navigate } from "react-router-dom";
import { logout } from "../../app/store/authSlice";
import { logoutRequest } from "../../features/auth/services/authService";
import { showError } from "../../app/store/snackbarSlice";

export default function Header() {
  const { usuario, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  if (!usuario || !token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    try {
      const res = await logoutRequest(token);
      console.log(res);

      dispatch(logout());
    } catch (error) {
      console.error(error);
      dispatch(showError("Error al cerrar sesión"));
    }
  };

  return (
    <header className="h-16 bg-cerulean-600 w-full px-4">
      <div className="flex items-center justify-between h-full max-w-5xl mx-auto gap-4">
        <h1 className="font-bold text-slate-100">ParkControl</h1>
        <nav className="flex gap-4 text-xs">
          <Link
            to="/acerca-de"
            className="text-slate-100 hover:text-cerulean-300 transition-colors duration-300"
          >
            {usuario.nombre + " " + usuario.apellido}
          </Link>

          <button
            className="text-slate-100 hover:text-cerulean-300 transition-colors duration-300 cursor-pointer"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </nav>
      </div>
    </header>
  );
}
