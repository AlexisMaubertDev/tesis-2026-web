import type { ReactNode } from "react";

type Props = {
  etiqueta: string;
  valor: ReactNode;
};

/** Fila "etiqueta / valor" que usan los modales de detalle. */
export default function DetailItem({ etiqueta, valor }: Props) {
  return (
    <div className="flex gap-2 items-start text-xs">
      <span className="w-2/5 bg-cerulean-200 text-white px-2 py-1 font-bold rounded">
        {etiqueta}
      </span>
      <span className="w-3/5 bg-cerulean-50 px-2 py-1 rounded break-words">
        {valor || "-"}
      </span>
    </div>
  );
}
