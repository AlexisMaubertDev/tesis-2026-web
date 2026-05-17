import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import { clearSnackbar } from "../../app/store/snackbarSlice";
import { useEffect, useState } from "react";

export default function Snackbar() {
  const { error, info, success } = useSelector(
    (state: RootState) => state.snackbar,
  );
  const [open, setOpen] = useState<boolean>(false);
  const dispatch = useDispatch();

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      dispatch(clearSnackbar());
    }, 300);
  };

  useEffect(() => {
    if (error || info || success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, [error, info, success]);

  return (
    <aside
      className={`fixed bottom-0 left-0 min-w-1/3 rounded-tr-lg bg-cerulean-50 p-4 transition-transform duration-300
        ${!open ? "translate-y-full" : "translate-y-0"}
        shadow-lg flex justify-between items-center gap-4 text-xs`}
    >
      {error && (
        <div className="flex items-center gap-2">
          <ErrorIcon className="text-red-500" fontSize="medium" />
          <p className="text-red-500">{error}</p>
        </div>
      )}
      {info && (
        <div className="flex items-center gap-2">
          <InfoIcon className="text-blue-500" fontSize="medium" />
          <p className="text-blue-500">{info}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="text-green-500" fontSize="medium" />
          <p className="text-green-500">{success}</p>
        </div>
      )}
      <button
        onClick={handleClose}
        className="cursor-pointer p-1 rounded-lg hover:bg-cerulean-200 transition-colors"
      >
        <CloseIcon fontSize="medium" className="text-cerulean-900" />
      </button>
    </aside>
  );
}
