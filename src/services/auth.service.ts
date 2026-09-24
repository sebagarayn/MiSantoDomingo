import { IUser } from "../types";

// Cuentas de prueba
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

// Valida si el correo existe en el arreglo de prueba
export const login = (email: string, _password?: string): IUser | null => {
  const usuario = usuariosPrueba.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );
  return usuario || null;
};

// Exportamos como objeto y por defecto para que sea comodo importarlo
export const authService = {
  usuariosPrueba,
  login,
};

export default authService;
