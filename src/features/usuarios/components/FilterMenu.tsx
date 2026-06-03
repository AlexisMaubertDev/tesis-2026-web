import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListSubheader from "@mui/material/ListSubheader";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import type { FiltrosUsuarios } from "../pages/UsuariosPage";
import Badge from "@mui/material/Badge";

type Props = {
  sucursales: {
    id: string;
    nombre: string;
    direccion: string;
  }[];
  filtros: FiltrosUsuarios;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosUsuarios>>;
};

export default function FilterMenu({ sucursales, filtros, setFiltros }: Props) {
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
    setFiltros((prev: FiltrosUsuarios) => ({
      ...prev,
      sucursales: prev.sucursales.includes(nombreSucursal)
        ? prev.sucursales.filter((nombre: string) => nombre !== nombreSucursal)
        : [...prev.sucursales, nombreSucursal],
    }));
  };

  const toggleTurno = (turno: number) => {
    setFiltros((prev: FiltrosUsuarios) => ({
      ...prev,
      turnos: prev.turnos.includes(turno)
        ? prev.turnos.filter((t: number) => t !== turno)
        : [...prev.turnos, turno],
    }));
  };
  const filtrosActivos =
    filtros.sucursales.length +
    filtros.turnos.length +
    (filtros.trabajaDomingos !== null ? 1 : 0) +
    (filtros.bloqueados ? 1 : 0);

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
            key={sucursal.nombre}
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
          Turno
        </ListSubheader>
        <MenuItem
          dense
          onClick={() => {
            toggleTurno(1);
            handleClose();
          }}
        >
          <ListItemIcon>
            <Checkbox checked={filtros.turnos.includes(1)} />
          </ListItemIcon>
          <p className="text-xs">1</p>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            toggleTurno(2);
            handleClose();
          }}
        >
          <ListItemIcon>
            <Checkbox checked={filtros.turnos.includes(2)} />
          </ListItemIcon>
          <p className="text-xs">2</p>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            toggleTurno(3);
            handleClose();
          }}
        >
          <ListItemIcon>
            <Checkbox checked={filtros.turnos.includes(3)} />
          </ListItemIcon>
          <p className="text-xs">3</p>
        </MenuItem>
        <Divider />
        <ListSubheader className="bg-cerulean-300! text-cerulean-50!">
          Trabaja domingos
        </ListSubheader>
        <MenuItem
          dense
          onClick={() => {
            setFiltros((prev: FiltrosUsuarios) => ({
              ...prev,
              trabajaDomingos: prev.trabajaDomingos === true ? null : true,
            }));
            handleClose();
          }}
        >
          <ListItemIcon>
            <Checkbox size="small" checked={filtros.trabajaDomingos === true} />
          </ListItemIcon>
          <p className="text-xs">Si</p>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setFiltros((prev: FiltrosUsuarios) => ({
              ...prev,
              trabajaDomingos: prev.trabajaDomingos === false ? null : false,
            }));
            handleClose();
          }}
        >
          <ListItemIcon>
            <Checkbox
              size="small"
              checked={filtros.trabajaDomingos === false}
            />
          </ListItemIcon>
          <p className="text-xs">No</p>
        </MenuItem>
        <Divider />
        <MenuItem
          dense
          onClick={() => {
            setFiltros((prev: FiltrosUsuarios) => ({
              ...prev,
              bloqueados: !prev.bloqueados,
            }));
            handleClose();
          }}
        >
          <ListItemIcon>
            <Checkbox checked={filtros.bloqueados} />
          </ListItemIcon>
          <p className="text-xs">Bloqueados</p>
        </MenuItem>
      </Menu>
    </>
  );
}
