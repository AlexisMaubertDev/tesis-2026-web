export default function CallToActionButton({
  children,
  type,
  disabled,
  handleSubmit,
}: {
  children: React.ReactNode;
  type: "button" | "submit" | "reset";
  disabled?: boolean;
  handleSubmit?: () => void;
}) {
  return (
    <button
      className="text-white text-xs bg-scarlet-rush-700 px-4 py-2 rounded-lg outline-2 outline-transparent hover:not-disabled:outline-scarlet-rush-900 disabled:bg-slate-400 disabled:cursor-default duration-300 ease-linear cursor-pointer"
      type={type}
      onClick={handleSubmit}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
