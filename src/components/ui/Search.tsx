import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import Tooltip from "@mui/material/Tooltip";

type Props = {
  value: string;
  title: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
};

export default function Search({ value, title, onChange, onSearch }: Props) {
  return (
    <div className="relative w-full">
      <Tooltip title={title}>
        <input
          className="w-full p-3 pr-12 border border-cerulean-700 rounded-lg bg-cerulean-50 focus-visible:outline-2 text-xs focus-visible:outline-cerulean-500"
          type="search"
          placeholder={"Buscar..."}
          value={value || ""}
          onChange={onChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch();
            }
          }}
        />
      </Tooltip>

      <button
        type="button"
        onClick={onSearch}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-cerulean-700 hover:text-cerulean-500 transition-colors duration-300 cursor-pointer"
      >
        <SearchIcon fontSize="small" />
      </button>
    </div>
  );
}
