import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import { test, expect, vi } from "vitest";

import { AuthContext, AuthContextType } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

// Simulamos el Toast de Ionic para evitar
// depender de la interfaz real durante la prueba.
vi.mock("@ionic/react", () => ({
  useIonToast: () => [vi.fn()],
}));

// Componente de ejemplo que representa una página protegida.
const PaginaAdmin = () => <h1>Panel de administrador</h1>;

// TEST 1: Usuario sin sesión intenta acceder a una ruta protegida.
test("ProtectedRoute redirige al login si el usuario no está autenticado", () => {
  // Simulamos una sesión sin usuario autenticado.
  const contexto: AuthContextType = {
    user: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
  };

  render(
    <AuthContext.Provider value={contexto}>
      <MemoryRouter initialEntries={["/admin"]}>
        <ProtectedRoute
          path="/admin"
          component={PaginaAdmin}
          roles={["admin"]}
        />

        <Route
          path="/login"
          render={() => <h1>Página de inicio de sesión</h1>}
        />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  // Debe aparecer la página de login.
    expect(
    screen.getByText("Página de inicio de sesión")
    ).toBeTruthy();

  // No debe aparecer el panel de administrador.
    expect(
    screen.queryByText("Panel de administrador")
    ).toBeNull();
});

//segunda prueba

test("ProtectedRoute bloquea a un vecino que intenta acceder como administrador", () => {
  // Simulamos un usuario autenticado con rol vecino.
  const contexto: AuthContextType = {
    user: {
      id: "1",
      nombre: "Usuario de prueba",
      email: "vecino@correo.cl",
      rol: "vecino",
    },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  };

  render(
    <AuthContext.Provider value={contexto}>
      <MemoryRouter initialEntries={["/admin"]}>
        <ProtectedRoute
          path="/admin"
          component={PaginaAdmin}
          roles={["admin"]}
        />

        <Route
          path="/login"
          render={() => <h1>Página de inicio de sesión</h1>}
        />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  // El vecino debe ser redirigido al login.
  expect(
    screen.getByText("Página de inicio de sesión")
  ).toBeTruthy();

  // No debe visualizar el panel de administrador.
  expect(
    screen.queryByText("Panel de administrador")
  ).toBeNull();
});

//Tercera prueba

test("ProtectedRoute permite el acceso a un administrador autorizado", () => {
  // Simulamos un administrador con sesión iniciada.
  const contexto: AuthContextType = {
    user: {
      id: "2",
      nombre: "Administrador de prueba",
      email: "admin@correo.cl",
      rol: "admin",
    },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  };

  render(
    <AuthContext.Provider value={contexto}>
      <MemoryRouter initialEntries={["/admin"]}>
        <ProtectedRoute
          path="/admin"
          component={PaginaAdmin}
          roles={["admin"]}
        />

        <Route
          path="/login"
          render={() => <h1>Página de inicio de sesión</h1>}
        />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  // El administrador debe visualizar el panel.
  expect(
    screen.getByText("Panel de administrador")
  ).toBeTruthy();

  // No debe ser redirigido al login.
  expect(
    screen.queryByText("Página de inicio de sesión")
  ).toBeNull();
});
