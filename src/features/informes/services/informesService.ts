import api from "../../../services/api";
import { mostrarPdf } from "../../../app/utils/informesPdf";
import type {
  Informe,
  ParametrosFinTurno,
  ParametrosInforme,
} from "../../../types/Informe";

/** Arma el query string con los parámetros del informe. */
const aQuery = (params: ParametrosInforme) => {
  const query = new URLSearchParams();

  query.set("tipo", params.tipo);
  query.set("modo", params.modo);

  if (params.modo === "RANGO") {
    if (params.desde) query.set("desde", params.desde);
    if (params.hasta) query.set("hasta", params.hasta);
    if (params.desdeHora) query.set("desde_hora", params.desdeHora);
    if (params.hastaHora) query.set("hasta_hora", params.hastaHora);
  }

  if (params.sucursal) query.set("sucursal", params.sucursal);

  return query.toString();
};

/**
 * Pide los datos del informe (movimientos de autos, cobros o acarreos) al
 * servidor. El servidor resuelve el "turno actual" según el rol del usuario.
 */
export const obtenerMovimientos = async (
  token: string,
  params: ParametrosInforme,
) => {
  const res = await api.get(`/informes/movimientos?${aQuery(params)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data as {
    success: boolean;
    data: Informe;
    message: string;
  };
};

/**
 * Abre el informe en PDF en una pestaña nueva (para imprimirlo).
 *
 * El PDF lo genera el servidor y requiere el token, así que no se puede usar un
 * `window.open` directo a la URL: se pide como blob y se abre el blob. El
 * `window.open` se hace antes del `await` para no perder el "gesto del usuario"
 * (si no, el navegador bloquea la pestaña emergente).
 */
export const abrirInformePdf = async (
  token: string,
  params: ParametrosInforme,
) => {
  const pestania = window.open("", "_blank");

  try {
    const res = await api.get(`/informes/movimientos.pdf?${aQuery(params)}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });

    const blobUrl = window.URL.createObjectURL(res.data as Blob);

    if (pestania) {
      pestania.location.href = blobUrl;
    } else {
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    }

    // Se libera el blob cuando el navegador ya lo cargó.
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
  } catch (err) {
    pestania?.close();
    throw err;
  }
};

/**
 * Abre el **informe consolidado de la sucursal** en PDF, en una pestaña nueva
 * (RF15 / CU13): en un mismo turno, los cobros de las cajas, los movimientos de
 * las barreras y los acarreos de las grúas.
 *
 * `fecha` es AAAA-MM-DD y `turno` el número de turno (1, 2 o 3). Si no se pasa
 * `turno`, el informe cubre todos los turnos de esa fecha.
 */
export const abrirInformeTurnoSucursal = async (
  token: string,
  params: { fecha?: string; turno?: string; sucursal?: string },
) => {
  const query = new URLSearchParams();

  if (params.fecha) query.set("fecha", params.fecha);
  if (params.turno) query.set("turno", params.turno);
  if (params.sucursal) query.set("sucursal", params.sucursal);

  const pestania = window.open("", "_blank");

  try {
    const res = await api.get(`/informes/consolidado.pdf?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });

    const blobUrl = window.URL.createObjectURL(res.data as Blob);

    if (pestania) {
      pestania.location.href = blobUrl;
    } else {
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    }

    // Se libera el blob cuando el navegador ya lo cargó.
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
  } catch (err) {
    pestania?.close();
    throw err;
  }
};

/**
 * Abre el **informe detallado de fin de turno** en PDF, en una pestaña nueva.
 *
 * Es el único informe que muestra la cuenta de vehículos por estado y el
 * detalle de todas las barreras, grúas y cajas de la sucursal. Sólo lo pueden
 * generar supervisores y sistemas.
 *
 * La pestaña se abre antes del `await` para no perder el gesto del usuario.
 */
export const abrirInformeFinTurno = async (
  token: string,
  params: ParametrosFinTurno,
) => {
  const query = new URLSearchParams();

  query.set("periodo", params.periodo);

  if (params.periodo === "RANGO") {
    if (params.desde) query.set("desde", params.desde);
    if (params.hasta) query.set("hasta", params.hasta);
    if (params.desdeHora) query.set("desde_hora", params.desdeHora);
    if (params.hastaHora) query.set("hasta_hora", params.hastaHora);
  } else if (params.fecha) {
    query.set("fecha", params.fecha);
  }

  if (params.sucursal) query.set("sucursal", params.sucursal);

  const pestania = window.open("", "_blank");

  try {
    const res = await api.get(`/informes/fin-turno.pdf?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });

    const blobUrl = window.URL.createObjectURL(res.data as Blob);

    mostrarPdf(
      blobUrl,
      pestania,
      `informe-fin-turno-${params.periodo.toLowerCase()}.pdf`,
    );

    // Se libera el blob cuando el navegador ya lo cargó.
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
  } catch (err) {
    pestania?.close();
    throw err;
  }
};
