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
      className="bg-orange-700  px-4 py-2 rounded-lg hover:bg-orange-500 disabled:bg-slate-400 disabled:cursor-default duration-200 ease-in cursor-pointer"
      type={type}
      onClick={handleSubmit}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
