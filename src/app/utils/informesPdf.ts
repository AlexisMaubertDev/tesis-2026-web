/**
 * Muestra un PDF que ya se generó en el servidor.
 *
 * Recibe la pestaña que se abrió **antes** del pedido (para no perder el gesto
 * del usuario). Si el navegador la bloqueó (`null`), intenta abrir una nueva y,
 * como último recurso, descarga el archivo para que el informe no se pierda
 * (por ejemplo, al cerrar varios turnos y abrir una pestaña por cada uno).
 */
export const mostrarPdf = (
  blobUrl: string,
  pestania: Window | null | undefined,
  nombreArchivo: string,
) => {
  if (pestania) {
    pestania.location.href = blobUrl;
    return;
  }

  if (window.open(blobUrl, "_blank", "noopener,noreferrer")) return;

  const enlace = document.createElement("a");
  enlace.href = blobUrl;
  // El nombre puede venir de una patente o de la ubicación de la barrera.
  enlace.download = nombreArchivo.replace(/[\\/:*?"<>|]+/g, "-");
  enlace.rel = "noopener";
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
};
