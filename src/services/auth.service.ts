import { IUser } from "../types";

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
    nombre: "Felipe OIRS (Funcionario)",
    email: "admin@correo.cl",
    rol: "admin",
    fechaRegistro: "2026-01-10",
  },
];

export const login = (email: string, _password?: string): IUser | null => {
  const usuario = usuariosPrueba.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );
  return usuario || null;
};

export const authService = {
  usuariosPrueba,
  login,
};

export default authService;
