// El token es un JWT. Para no dejar una sesión vencida en el cliente hasta que
// la primera petición falle con 401, se lee su payload (`exp`, en segundos) sin
// verificar la firma: eso lo hace el servidor en cada request.
export const isTokenExpired = (token?: string | null): boolean => {
  if (!token) return true;

  const payload = token.split(".")[1];
  if (!payload) return false;

  try {
    // base64url -> base64 (+ padding) para que `atob` lo acepte.
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const { exp } = JSON.parse(atob(padded)) as { exp?: number };

    return typeof exp === "number" && exp * 1000 <= Date.now();
  } catch {
    // Si no se puede leer, no se asume vencido: el 401 del servidor decide.
    return false;
  }
};
