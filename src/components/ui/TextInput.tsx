export default function TextInput({
  value,
  onChange,
  placeholder,
  name,
  type,
  disabled,
}: {
  value: string | number | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  name: string;
  type: string;
  disabled?: boolean;
}) {
  return (
    <input
      className="w-full p-2 border border-cerulean-700 rounded-lg bg-cerulean-50 focus-visible:outline-2 text-xs focus-visible:outline-cerulean-500"
      type={type}
      placeholder={placeholder}
      name={name}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
