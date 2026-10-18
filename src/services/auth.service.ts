import { IUser, UserRole } from "../types";

export const usuariosPrueba: IUser[] = [
  {
    id: "usr-vecino-1",
    nombre: "María González (Vecina)",
    email: "vecino@correo.cl",
    rol: "vecino",
    fechaRegistro: "2026-01-15",
  },
  {
    id: "usr-admin-1",
    nombre: "Felipe Pérez (Funcionario)",
    email: "admin@correo.cl",
    rol: "admin",
    fechaRegistro: "2026-01-10",
  },
];

export const login = (email: string, _password?: string): IUser | null => {
  const correo = email.trim().toLowerCase();
  const rol: UserRole = correo.includes("admin") ? "admin" : "vecino";

  return {
    id: rol === "admin" ? "usr-admin-1" : "usr-vecino-1",
    nombre:
      rol === "admin"
        ? "Felipe Pérez (Funcionario)"
        : "María González (Vecina)",
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
