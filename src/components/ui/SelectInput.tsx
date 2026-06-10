type Option = {
  value: string | number;
  label: string;
};

type Props = {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  placeholder: string;
  name: string;
};

export default function SelectInput({
  value,
  onChange,
  options,
  placeholder,
  name,
}: Props) {
  return (
    <select
      className="w-full py-2 px-2 border border-cerulean-700 rounded-lg bg-cerulean-50 focus-visible:outline-2 focus-visible:outline-cerulean-500 text-xs cursor-pointer"
      name={name}
      value={value}
      onSelect={onChange}
      onChange={onChange}
    >
      <option value="" disabled>
        {placeholder}
      </option>

      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-xs cursor-pointer"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
