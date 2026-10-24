/**
 * Abre `cantidad` pestañas en blanco **dentro del gesto del usuario** (click),
 * para después cargar en ellas los PDFs que genera el servidor.
 *
 * Los navegadores sólo permiten abrir pestañas mientras dura el gesto, por eso
 * hay que abrirlas antes de cualquier `await`. Si el navegador bloquea alguna,
 * esa posición queda en `null` (y el servicio que carga el PDF intenta abrirla
 * igual al final).
 */
export const abrirPestanias = (cantidad: number) =>
  Array.from({ length: Math.max(0, cantidad) }, () => window.open("", "_blank"));

/** Cierra las pestañas que no se llegaron a usar (por ejemplo, si algo falló). */
export const cerrarPestanias = (pestanias: (Window | null)[]) =>
  pestanias.forEach((pestania) => pestania?.close());
