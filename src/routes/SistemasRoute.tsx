import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { type RootState } from "../app/store";
import type React from "react";

type Props = {
  children: React.ReactNode;
};

export default function SistemasRoute({ children }: Props) {
  const { usuario } = useSelector((state: RootState) => state.auth);
  const rolesPermitidos = ["SISTEMAS"];

  if (usuario?.rol && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
