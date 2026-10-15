import { IUser, UserRole } from "../types";

export const usuariosPrueba: IUser[] = [
  {
    id: "usr-vecino-1",
    nombre: "Juan Pérez (Vecino)",
    email: "juan@correo.cl",
    rol: "vecino",
    fechaRegistro: "2026-01-15",
  },
  {
    id: "usr-admin-1",
    nombre: "Felipe OIRS (Funcionario)",
    email: "admin@correo.cl",
    rol: "admin",
    fechaRegistro: "2026-01-10",
  },
];

// Función síncrona que satisface los tipos de LoginPage.tsx sin romper la compilación
export const login = (email: string, _password?: string): IUser | null => {
  const correo = email.trim().toLowerCase();
  const rol: UserRole = correo.includes("admin") ? "admin" : "vecino";

  return {
    id: rol === "admin" ? "usr-admin-1" : "usr-vecino-1",
    nombre:
      rol === "admin" ? "Felipe OIRS (Funcionario)" : "Juan Pérez (Vecino)",
    email: correo,
    rol,
    fechaRegistro: new Date().toISOString(),
  };
};

export const authService = {
  usuariosPrueba,
  login,
};

export default authService;
