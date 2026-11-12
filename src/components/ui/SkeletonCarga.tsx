import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

type Props = {
  /** Cantidad de filas skeleton a mostrar (por defecto 6). */
  filas?: number;
  /** Alto de cada fila en px (por defecto 36). */
  alto?: number;
};

/**
 * Skeleton de carga (MUI) para las tablas de datos y los homes: muestra filas
 * que pulsan hasta que terminan de llegar los datos del servidor.
 */
export default function SkeletonCarga({ filas = 6, alto = 36 }: Props) {
  return (
    <Box className="w-full flex flex-col gap-2 py-2 min-h-[80vh]">
      {Array.from({ length: filas }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          height={alto}
          animation="wave"
          sx={{ bgcolor: "grey.300" }}
        />
      ))}
    </Box>
  );
}
