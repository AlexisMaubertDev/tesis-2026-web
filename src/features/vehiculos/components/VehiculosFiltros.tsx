import Badge from "@mui/material/Badge";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListSubheader from "@mui/material/ListSubheader";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import React from "react";
import { ESTADOS_ACARREO } from "../../../app/constants/estados";
import type { Sucursal } from "../../../types/Sucursal";
import type { EstadoAcarreo } from "../../../types/Vehiculo";
import type { FiltrosVehiculos } from "../pages/VehiculosPage";

type Props = {
  sucursales: Sucursal[];
  filtros: FiltrosVehiculos;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosVehiculos>>;
};

const FILTROS_VACIOS: FiltrosVehiculos = {
  sucursales: [],
  estados: [],
  fechaDesde: "",
  fechaHasta: "",
};

export default function VehiculosFiltros({
  sucursales,
  filtros,
  setFiltros,
}: Props) {
  const id = React.useId();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleSucursal = (nombreSucursal: string) => {
    setFiltros((prev) => ({
      ...prev,
      sucursales: prev.sucursales.includes(nombreSucursal)
        ? prev.sucursales.filter((nombre) => nombre !== nombreSucursal)
        : [...prev.sucursales, nombreSucursal],
    }));
  };

  const toggleEstado = (estado: EstadoAcarreo) => {
    setFiltros((prev) => ({
      ...prev,
      estados: prev.estados.includes(estado)
        ? prev.estados.filter((item) => item !== estado)
        : [...prev.estados, estado],
    }));
  };

  const filtrosActivos =
    filtros.sucursales.length +
    filtros.estados.length +
    (filtros.fechaDesde || filtros.fechaHasta ? 1 : 0);

  return (
    <>
      <Tooltip title="Filtrar">
        <button
          type="button"
          id={buttonId}
          aria-controls={open ? menuId : undefined}
          aria-haspopup="true"
          aria-expanded={open}
          onClick={handleClick}
          className={`
      transition-colors duration-300 cursor-pointer
      ${
        filtrosActivos > 0
          ? "text-scarlet-rush-600 hover:text-scarlet-rush-300"
          : "text-cerulean-700 hover:text-cerulean-500"
      }
    `}
        >
          <Badge
            badgeContent={filtrosActivos}
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: "#ad1f28",
                color: "white",
              },
            }}
            invisible={filtrosActivos === 0}
          >
            <FilterAltIcon fontSize="large" />
          </Badge>
        </button>
      </Tooltip>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        classes={{
          paper: "bg-cerulean-50!",
          list: "pt-0!",
        }}
        slotProps={{
          list: {
            "aria-labelledby": buttonId,
          },
        }}
      >
        <ListSubheader className="bg-cerulean-300! text-cerulean-50!">
          Sucursal
        </ListSubheader>
        {sucursales.map((sucursal) => (
          <MenuItem
            dense
            key={sucursal.id ?? sucursal.nombre}
            onClick={() => {
              handleClose();
              toggleSucursal(sucursal.nombre);
            }}
          >
            <ListItemIcon>
              <Checkbox
                size="small"
                checked={filtros.sucursales.includes(sucursal.nombre)}
              />
            </ListItemIcon>
            <p className="text-xs">{sucursal.nombre}</p>
          </MenuItem>
        ))}
        <Divider />
        <ListSubheader className="bg-cerulean-300! text-cerulean-50!">
          Estado
        </ListSubheader>
        {ESTADOS_ACARREO.map((estado) => (
          <MenuItem
            dense
            key={estado}
            onClick={() => {
              toggleEstado(estado);
              handleClose();
            }}
          >
            <ListItemIcon>
              <Checkbox size="small" checked={filtros.estados.includes(estado)} />
            </ListItemIcon>
            <p className="text-xs">{estado}</p>
          </MenuItem>
        ))}
        <Divider />
        <ListSubheader className="bg-cerulean-300! text-cerulean-50!">
          Fecha del último acarreo
        </ListSubheader>
        {/* Los inputs de fecha viven dentro del menú: se corta la propagación
            de los eventos para que MUI no intercepte las flechas ni el tipeo. */}
        <MenuItem disableGutters onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-2 w-full px-4 py-1">
            <label className="flex items-center gap-2 text-xs">
              <span className="w-12">Desde</span>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    fechaDesde: e.target.value,
                  }))
                }
                onKeyDown={(e) => e.stopPropagation()}
                className="p-2 border border-cerulean-700 rounded-lg bg-cerulean-50 text-xs focus-visible:outline-2 focus-visible:outline-cerulean-500"
              />
            </label>
            <label className="flex items-center gap-2 text-xs">
              <span className="w-12">Hasta</span>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    fechaHasta: e.target.value,
                  }))
                }
                onKeyDown={(e) => e.stopPropagation()}
                className="p-2 border border-cerulean-700 rounded-lg bg-cerulean-50 text-xs focus-visible:outline-2 focus-visible:outline-cerulean-500"
              />
            </label>
          </div>
        </MenuItem>
        <Divider />
        <MenuItem
          dense
          onClick={() => {
            setFiltros(FILTROS_VACIOS);
            handleClose();
          }}
        >
          <p className="text-xs font-semibold text-scarlet-rush-600">
            Limpiar filtros
          </p>
        </MenuItem>
      </Menu>
    </>
  );
}
