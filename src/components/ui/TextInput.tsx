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
      className="w-full p-3 border border-san-marino-700 rounded-lg bg-san-marino-500 focus-visible:outline focus-visible:outline-san-marino-6ñlads00"
      type={type}
      placeholder={placeholder}
      name={name}
      value={value || ""}
      onChange={onChange}
    />
  );
}
