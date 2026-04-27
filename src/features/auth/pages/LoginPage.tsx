import { useState } from "react";
import { loginRequest } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../../components/layout/PageLayout";
import CallToActionButton from "../../../components/ui/CallToActionButton";
import TextInput from "../../../components/ui/TextInput";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ dni: null, password: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (credentials.dni === null || !credentials.password.trim()) {
      setCredentials({ dni: null, password: "" });
      setError("Por favor, ingresa tu DNI y contraseña");
      return;
    }

    setLoading(true);

    try {
      const data = await loginRequest({
        dni: credentials.dni,
        password: credentials.password.trim(),
      });
      if (!data.success) {
        setError(data.message || "Error al iniciar sesión");
        return;
      }
      login(data);
      navigate("/");
    } catch (err) {
      console.log(err);
      setError("Error en el servidor. Intenta nuevamente más tarde.");
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
          className="flex flex-col gap-6 bg-san-marino-400 p-8 rounded-2xl shadow-xl w-96"
        >
          <h2 className="text-2xl font-bold text-center">Iniciar sesión</h2>
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

          {error && (
            <p className="bg-san-marino-100 p-1 rounded-lg text-center text-red-500">
              {error}
            </p>
          )}
          <div className="flex w-full justify-center">
            <CallToActionButton type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </CallToActionButton>
          </div>
        </form>

        <p className="text-center text-san-marino-900">
          Creado por <span className="font-bold">Alexis Maubert</span>
        </p>
      </section>
    </PageLayout>
  );
}
