import React from "react";

export interface Option {
  value: string | number;
  label: string;
  group?: string; // Propiedad opcional para agrupar
}

export default function SelectInput({
  value,
  onChange,
  placeholder,
  name,
  options,
  disabled,
}: {
  value: string | number | null;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder: string;
  name: string;
  options: Option[];
  disabled?: boolean;
}) {
  // Comprobamos si hay al menos una opción con la propiedad 'group'
  const isGrouped = options.some((opt) => opt.group);

  // Agrupamos las opciones utilizando reduce para compatibilidad universal
  const groupedOptions = isGrouped
    ? options.reduce(
        (acc, option) => {
          const groupName = option.group || "Sin Grupo";
          if (!acc[groupName]) acc[groupName] = [];
          acc[groupName].push(option);
          return acc;
        },
        {} as Record<string, Option[]>,
      )
    : null;

  return (
    <select
      className="w-full p-2 border border-cerulean-700 rounded-lg bg-cerulean-50 focus-visible:outline-2 text-xs focus-visible:outline-cerulean-500"
      name={name}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
    >
      <option value="" disabled>
        {placeholder}
      </option>

      {groupedOptions
        ? Object.entries(groupedOptions).map(([groupLabel, groupItems]) => (
            <optgroup key={groupLabel} label={groupLabel}>
              {groupItems.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))
        : options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
    </select>
  );
}
