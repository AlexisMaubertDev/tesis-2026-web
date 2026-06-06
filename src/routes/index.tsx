import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import Home from "../pages/Home.tsx";
import SistemasRoute from "./SistemasRoute.tsx";
import UsuariosPage from "../features/usuarios/pages/UsuariosPage.tsx";
import VehiculosPage from "../features/vehiculos/pages/VehiculosPage.tsx";
import SucursalesPage from "../features/sucursales/pages/SucursalesPage.tsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <SistemasRoute>
                <UsuariosPage />
              </SistemasRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sucursales"
          element={
            <ProtectedRoute>
              <SistemasRoute>
                <SucursalesPage />
              </SistemasRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehiculos"
          element={
            <ProtectedRoute>
              <VehiculosPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
