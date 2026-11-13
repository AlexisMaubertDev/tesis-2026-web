import { useEffect } from "react";
import Modal from "@mui/material/Modal";
import type { DamageData, DamagesAcarreo } from "../../../types/DamageInspection";

type Vista = {
  etiqueta: string;
  imagen: string;
  damage: DamageData | null | undefined;
};

type Props = {
  open: boolean;
  onClose: () => void;
  damages: DamagesAcarreo;
  patente?: string;
};

/**
 * Modal "Ver daños" de un acarreo (solo web): muestra las mismas fotos del
 * vehículo que usa la app móvil con los trazos de daños superpuestos.
 *
 * En la app los puntos se guardan en las coordenadas de un canvas cuadrado
 * con la imagen en `contain`; acá se replica ese esquema (contenedor
 * cuadrado + SVG con el mismo viewBox) para mantener la relación de aspecto.
 */
export default function DanosAcarreoModal({
  open,
  onClose,
  damages,
  patente,
}: Props) {
  // Cierra el modal con Escape y bloquea el scroll de fondo (como MUI).
  useEffect(() => {
    if (!open) return;

    const manejarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onClose();
    };

    document.addEventListener("keydown", manejarTecla);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", manejarTecla);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const vistas: Vista[] = [
    { etiqueta: "Frontal", imagen: "/vehiculo-danos/frontal.png", damage: damages.frontal },
    { etiqueta: "Lateral izquierdo", imagen: "/vehiculo-danos/lateraliz.png", damage: damages.lateralIzq },
    { etiqueta: "Lateral derecho", imagen: "/vehiculo-danos/lateralder.png", damage: damages.lateralDer },
    { etiqueta: "Trasera", imagen: "/vehiculo-danos/trasera.png", damage: damages.trasera },
    { etiqueta: "Techo", imagen: "/vehiculo-danos/superior.png", damage: damages.techo },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <div className="w-full max-w-4/5 md:max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans">
        <h2 className="text-center font-bold uppercase">
          {`Daños del acarreo${patente ? ` - ${patente}` : ""}`}
        </h2>

        <p className="text-xs text-cerulean-700 text-center mt-1">
          Trazos cargados desde la inspección de la aplicación móvil.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {vistas.map((vista) => (
            <div
              key={vista.etiqueta}
              className="flex flex-col items-center gap-1 bg-cerulean-50 border border-cerulean-200 rounded p-2"
            >
              <span className="text-xs font-bold">{vista.etiqueta}</span>

              {(vista.damage?.paths ?? []).length ? (
                <VistaDanos imagen={vista.imagen} damage={vista.damage!} />
              ) : (
                <span className="text-xs text-cerulean-600 py-6">
                  Sin daños registrados
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-cerulean-600 hover:bg-cerulean-700 text-white text-sm font-bold px-4 py-2 rounded cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}

function VistaDanos({
  imagen,
  damage,
}: {
  imagen: string;
  damage: DamageData;
}) {
  const ancho = damage.width || 1;
  const alto = damage.height || 1;

  const construirPath = (points: { x: number; y: number }[]) =>
    points.reduce(
      (acumulado, punto, indice) =>
        indice === 0 ? `M ${punto.x} ${punto.y}` : `${acumulado} L ${punto.x} ${punto.y}`,
      "",
    );

  return (
    // Cuadrado como el canvas de la app: la imagen va en `contain` dentro del
    // cuadrado y el SVG usa el mismo viewBox (1 unidad = 1 px del canvas), así
    // los trazos mantienen la posición y la relación de aspecto original.
    <div className="relative w-full max-w-[280px] aspect-square overflow-hidden rounded bg-cerulean-200">
      <img
        src={imagen}
        alt="Vista del vehículo"
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />
      <svg
        viewBox={`0 0 ${ancho} ${alto}`}
        className="absolute inset-0 w-full h-full"
      >
        {damage.paths.map((path, indice) => (
          <path
            key={indice}
            d={construirPath(path.points)}
            fill="none"
            stroke="rgba(255,0,0,0.5)"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
}
