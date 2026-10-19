import Modal from "@mui/material/Modal";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import type { Acarreo } from "../../../types/Acarreo";
import type { Vehiculo } from "../../../types/Vehiculo";
import { obtenerAcarreosPorPatente } from "../services/vehiculosService";
import VehiculoDetalle from "./VehiculoDetalle";

type Props = {
  open: boolean;
  onClose: () => void;
  vehiculo: Vehiculo | null;
};

/**
 * Modal "Ver más" de la tabla de vehículos. Muestra los datos del vehículo y
 * el historial de sus acarreos con el mismo componente que la página de
 * historial (`VehiculoDetalle`).
 */
export default function VehiculoDetalleModal({
  open,
  onClose,
  vehiculo,
}: Props) {
  const { token } = useSelector((state: RootState) => state.auth);
  const [acarreos, setAcarreos] = useState<Acarreo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patente = vehiculo?.patente;

  useEffect(() => {
    let activo = true;

    const cargarAcarreos = async () => {
      if (!open || !patente || !token) {
        setAcarreos([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await obtenerAcarreosPorPatente(token, patente);
        if (activo) setAcarreos(res.data as Acarreo[]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (!activo) return;
        setError(
          err.response?.data?.message ||
            "No se pudo cargar el historial. Intenta nuevamente más tarde.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarAcarreos();

    return () => {
      activo = false;
    };
  }, [open, patente, token]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <div className="w-full max-w-4/5 md:max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-cerulean-100 p-6 shadow-lg font-sans">
        <h2 className="text-center font-bold uppercase">
          {`Detalle del vehículo ${vehiculo?.patente ?? ""}`}
        </h2>

        <VehiculoDetalle
          vehiculo={vehiculo}
          acarreos={acarreos}
          loading={loading}
          error={error}
        />

        <div className="flex justify-center mt-6">
          <CallToActionButton type="button" handleSubmit={onClose}>
            Cerrar
          </CallToActionButton>
        </div>
      </div>
    </Modal>
  );
}
