export default function TextInput({
  value,
  onChange,
  placeholder,
  name,
  type,
}: {
  value: string | number | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  name: string;
  type: string;
}) {
  return (
    <input
      className="w-full p-3 border border-cerulean-700 rounded-lg bg-cerulean-50 focus-visible:outline-2 text-xs focus-visible:outline-cerulean-500"
      type={type}
      placeholder={placeholder}
      name={name}
      value={value || ""}
      onChange={onChange}
    />
  );
}
