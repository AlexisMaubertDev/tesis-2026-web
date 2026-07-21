import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import Home from "../pages/Home.tsx";
import SistemasRoute from "./SistemasRoute.tsx";
import UsuariosPage from "../features/usuarios/pages/UsuariosPage.tsx";
import VehiculosPage from "../features/vehiculos/pages/VehiculosPage.tsx";
import SucursalesPage from "../features/sucursales/pages/SucursalesPage.tsx";
import GruasPage from "../features/gruas/pages/GruasPage.tsx";
import CajasPage from "../features/cajas/pages/CajasPage.tsx";
import BarrerasPage from "../features/barreras/pages/BarrerasPage.tsx";
import SupervisorPage from "../features/supervisor/pages/SupervisorPage.tsx";
import UsuariosSupervisorPage from "../features/supervisor/pages/UsuariosSupervisorPage.tsx";
import CajerosPage from "../features/cajeros/pages/CajerosPage.tsx";

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
          path="/cajeros"
          element={
            <ProtectedRoute>
              <CajerosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor"
          element={
            <ProtectedRoute>
              <SupervisorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/usuarios"
          element={
            <ProtectedRoute>
              <UsuariosSupervisorPage />
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
          path="/gruas"
          element={
            <ProtectedRoute>
              <SistemasRoute>
                <GruasPage />
              </SistemasRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cajas"
          element={
            <ProtectedRoute>
              <SistemasRoute>
                <CajasPage />
              </SistemasRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/barreras"
          element={
            <ProtectedRoute>
              <SistemasRoute>
                <BarrerasPage />
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
