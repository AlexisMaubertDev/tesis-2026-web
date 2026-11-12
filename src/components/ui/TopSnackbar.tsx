import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import { clearSnackbar } from "../../app/store/snackbarSlice";
import { useEffect, useState } from "react";

/**
 * Aviso informativo que entra desde arriba (color info/azul). Lo usan los
 * cambios de sesión: token vencido y "el sistema volvió, ingresá tus
 * credenciales para sincronizar".
 */
export default function TopSnackbar() {
  const topInfo = useSelector((state: RootState) => state.snackbar.topInfo);
  const [open, setOpen] = useState<boolean>(false);
  const dispatch = useDispatch();

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      dispatch(clearSnackbar());
    }, 300);
  };

  useEffect(() => {
    if (topInfo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, [topInfo]);

  if (!topInfo) return null;

  return (
    <aside
      className={`fixed top-0 right-0 bg-cerulean-50  text-cerulean-900 p-4 shadow-lg rounded-b
        transition-transform duration-300
        ${!open ? "-translate-y-full" : "translate-y-0"}
        flex justify-between items-center gap-4 text-xs z-60 font-sans`}
      role="status"
    >
      <div className="flex items-center gap-2">
        <InfoIcon className="text-blue-800" fontSize="medium" />
        <p>{topInfo}</p>
      </div>
      <button
        type="button"
        onClick={handleClose}
        aria-label="Cerrar aviso"
        className="p-1 cursor-pointer"
      >
        <CloseIcon fontSize="medium" />
      </button>
    </aside>
  );
}
