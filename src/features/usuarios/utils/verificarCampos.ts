import type { UsuarioForm } from "../components/NuevoUsuarioModal";

export const verificarCampos = (
  formData: UsuarioForm,
  setError: (error: string | null) => void,
): boolean => {
  if (!formData.nombre.trim()) {
    setError("El campo 'Nombre' es obligatorio");
    return false;
  }
  if (!formData.apellido.trim()) {
    setError("El campo 'Apellido' es obligatorio");
    return false;
  }

  if (
    !formData.dni.trim() ||
    formData.dni.length < 7 ||
    formData.dni.length > 8
  ) {
    setError("Ingresar un DNI válido (7 u 8 dígitos)");
    return false;
  }
  if (!formData.legajo.trim()) {
    setError("El campo 'Legajo' es obligatorio");
    return false;
  }
  if (formData.legajo.length < 4) {
    setError("El legajo debe tener al menos 4 dígitos");
    return false;
  }

  if (
    !formData.email ||
    !formData.email.trim() ||
    !formData.email.includes("@")
  ) {
    setError("Ingresar un email valido");
    return false;
  }
  if (!formData.password.trim()) {
    setError("El campo 'Contraseña' es obligatorio");
    return false;
  }

  if (formData.password.length < 8) {
    setError("La contraseña debe tener al menos 8 caracteres");
    return false;
  }

  if (!/[A-Z]/.test(formData.password)) {
    setError("La contraseña debe contener al menos una mayúscula");
    return false;
  }

  if (!/\d/.test(formData.password)) {
    setError("La contraseña debe contener al menos un número");
    return false;
  }

  if (!formData.Sucursal.nombre || !formData.Sucursal.nombre!.trim()) {
    setError("El campo 'Sucursal' es obligatorio");
    return false;
  }

  if (
    formData.numero_turno !== 1 &&
    formData.numero_turno !== 2 &&
    formData.numero_turno !== 3
  ) {
    setError("Los valores permitidos para turno son 1, 2 o 3");
    return false;
  }
  // Add more validation checks as needed

  return true;
};
