import React from "react";

export default function TextArea({
  value,
  onChange,
  placeholder,
  name,
  rows = 4,
  disabled,
}: {
  value: string | number | null;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  name: string;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <textarea
      className="w-full p-2 border border-cerulean-700 rounded-lg bg-cerulean-50 focus-visible:outline-2 text-xs focus-visible:outline-cerulean-500 resize-y"
      placeholder={placeholder}
      name={name}
      value={value || ""}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
    />
  );
}
