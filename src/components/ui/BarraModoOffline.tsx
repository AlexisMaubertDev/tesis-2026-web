import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import CloudOffIcon from "@mui/icons-material/CloudOff";

/**
 * Barra fija inferior, no cerrable, que aclara que la app está en "modo
 * sin conexión": visible siempre que no haya red o la API no responda,
 * incluso en la pantalla de login. Todo lo que se cargue queda en el
 * dispositivo y se envía cuando el sistema vuelva.
 */
export default function BarraModoOffline() {
  const { browserOnline, apiStatus } = useSelector(
    (state: RootState) => state.offline,
  );

  const visible = !browserOnline || apiStatus === "down";

  if (!visible) return null;

  return (
    <aside
      className="fixed bottom-0 left-0 w-full font-sans bg-cerulean-900 text-cerulean-50
        text-xs font-medium flex items-center justify-center gap-2 p-2 shadow-2xl z-50"
      role="status"
    >
      <CloudOffIcon fontSize="medium" />
      <span>
        Modo sin conexión: los datos se guardan en este dispositivo y se
        sincronizan cuando se pueda conectar al servidor.
      </span>
    </aside>
  );
}
