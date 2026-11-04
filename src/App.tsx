import { useEffect } from "react";
import AppRoutes from "./routes";
import PwaUpdatePrompt from "./components/ui/PwaUpdatePrompt";
import { iniciarSync } from "./app/offline/sync";

function App() {
  useEffect(() => {
    // Arranca la detección de API caída y el flush automático de la outbox.
    // Es idempotente, así que el doble montaje de StrictMode no duplica nada.
    iniciarSync();
  }, []);

  return (
    <>
      <AppRoutes />
      <PwaUpdatePrompt />
    </>
  );
}

export default App;
