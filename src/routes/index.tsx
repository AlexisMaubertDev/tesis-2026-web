import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import Home from "../pages/Home.tsx";
import SistemasRoute from "./SistemasRoute.tsx";
import UsuariosPage from "../features/usuarios/pages/UsuariosPage.tsx";
import VehiculosPage from "../features/vehiculos/pages/VehiculosPage.tsx";
import HistorialVehiculoPage from "../features/vehiculos/pages/HistorialVehiculoPage.tsx";
import SucursalesPage from "../features/sucursales/pages/SucursalesPage.tsx";
import GruasPage from "../features/gruas/pages/GruasPage.tsx";
import CajasPage from "../features/cajas/pages/CajasPage.tsx";
import BarrerasPage from "../features/barreras/pages/BarrerasPage.tsx";
import SupervisorPage from "../features/supervisor/pages/SupervisorPage.tsx";
import UsuariosSupervisorPage from "../features/supervisor/pages/UsuariosSupervisorPage.tsx";
import CajasSupervisorPage from "../features/supervisor/pages/CajasSupervisorPage.tsx";
import GruasSupervisorPage from "../features/supervisor/pages/GruasSupervisorPage.tsx";
import BarrerasSupervisorPage from "../features/supervisor/pages/BarrerasSupervisorPage.tsx";
import CajerosPage from "../features/cajeros/pages/CajerosPage.tsx";
import CierresCajaPage from "../features/cajeros/pages/CierresCajaPage.tsx";
import CobroPage from "../features/cobros/pages/CobroPage.tsx";
import TarifasPage from "../features/tarifas/pages/TarifasPage.tsx";
import AcercaDe from "../pages/AcercaDe.tsx";

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
          path="/cajeros/cierres"
          element={
            <ProtectedRoute>
              <CierresCajaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cajeros/cobrar/:patente"
          element={
            <ProtectedRoute>
              <CobroPage />
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
          path="/supervisor/cajas"
          element={
            <ProtectedRoute>
              <CajasSupervisorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/gruas"
          element={
            <ProtectedRoute>
              <GruasSupervisorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/barreras"
          element={
            <ProtectedRoute>
              <BarrerasSupervisorPage />
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
          path="/tarifas"
          element={
            <ProtectedRoute>
              <SistemasRoute>
                <TarifasPage />
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
        <Route
          path="/vehiculos/:patente/historial"
          element={
            <ProtectedRoute>
              <HistorialVehiculoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/acerca-de"
          element={
            <ProtectedRoute>
              <AcercaDe />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
