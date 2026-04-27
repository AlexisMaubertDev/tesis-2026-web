import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { type RootState } from "../app/store";
import type { JSX } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
