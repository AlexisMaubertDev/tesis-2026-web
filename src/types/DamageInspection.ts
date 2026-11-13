/**
 * Datos de daños dibujados sobre la foto del vehículo en la app móvil.
 *
 * Los `paths` vienen como puntos en las coordenadas del canvas de la app (un
 * cuadrado de `width` x `height`, con la imagen en `contain`), así que en la
 * web se reproduce el mismo esquema: contenedor cuadrado + SVG superpuesto
 * con el mismo viewBox, para mantener la relación de aspecto y que los
 * trazos caigan sobre la misma zona de la imagen.
 */
export type Point = { x: number; y: number };

export type DamagePath = { points: Point[] };

export type DamageData = {
  width: number;
  height: number;
  paths: DamagePath[];
};

export type DamagesAcarreo = {
  frontal?: DamageData | null;
  lateralIzq?: DamageData | null;
  lateralDer?: DamageData | null;
  trasera?: DamageData | null;
  techo?: DamageData | null;
};
