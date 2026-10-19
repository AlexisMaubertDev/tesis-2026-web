export default function CallToActionButton({
  children,
  type,
  disabled,
  handleSubmit,
  className = "",
}: {
  children: React.ReactNode;
  type: "button" | "submit" | "reset";
  disabled?: boolean;
  handleSubmit?: () => void;
  /** Clases extra para ajustar el layout del botón (ej: whitespace-nowrap). */
  className?: string;
}) {
  return (
    <button
      className={`text-white text-xs bg-scarlet-rush-700 px-4 py-2 rounded-lg outline-2 outline-transparent hover:not-disabled:outline-scarlet-rush-900 disabled:bg-slate-400 disabled:cursor-default duration-300 ease-linear cursor-pointer ${className}`}
      type={type}
      onClick={handleSubmit}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
