import { useState } from "react";
import { loginRequest } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../../components/layout/PageLayout";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import TextInput from "../../../components/ui/TextInput";
import { useDispatch } from "react-redux";
import { clearSnackbar, showError } from "../../../app/store/snackbarSlice";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ dni: null, password: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(clearSnackbar());

    if (credentials.dni === null || !credentials.password.trim()) {
      setCredentials({ dni: null, password: "" });
      dispatch(showError("Por favor, ingresa tu DNI y contraseña"));
      return;
    }

    setLoading(true);

    try {
      const data = await loginRequest({
        dni: credentials.dni,
        password: credentials.password.trim(),
      });
      login(data);
      navigate("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log(err);
      dispatch(
        showError(
          err.response?.data?.message ||
            "Error en el servidor. Intenta nuevamente más tarde.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <PageLayout>
      <section className="flex flex-col justify-between min-h-screen pb-2 pt-24">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 bg-san-marino-200 p-4 sm:p-8 rounded shadow-xl max-w-96 mx-4"
        >
          <h2 className="text-2xl font-bold text-center">Ingresar</h2>
          <p>Por favor, ingresa tu DNI y contraseña</p>
          <div className="flex flex-col gap-2">
            <TextInput
              type="number"
              placeholder="DNI"
              name="dni"
              value={credentials.dni || ""}
              onChange={handleChange}
            />

            <TextInput
              type="password"
              name="password"
              placeholder="Contraseña"
              value={credentials.password}
              onChange={handleChange}
            />
          </div>
          <div className="flex w-full justify-center">
            <CallToActionButton type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </CallToActionButton>
          </div>
        </form>

        <p className="text-center text-san-marino-900 pb-32 sm:pb-20">
          Creado por <span className="font-bold">Alexis Maubert</span>
        </p>
      </section>
    </PageLayout>
  );
}
