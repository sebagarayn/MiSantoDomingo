
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { MemoryRouter, Route, useLocation } from "react-router-dom";

import LoginPage from "./LoginPage";
import { useAuth } from "../../hooks/useAuth";

// Simulamos el hook de autenticación.
vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

// Simulamos los componentes de Ionic que utiliza LoginPage.
vi.mock("@ionic/react", () => ({
  IonPage: ({ children }: any) => <div>{children}</div>,
  IonContent: ({ children }: any) => <div>{children}</div>,
  IonCard: ({ children }: any) => <div>{children}</div>,
  IonCardContent: ({ children }: any) => <div>{children}</div>,
  IonIcon: () => <span />,
  IonSpinner: () => <span>Cargando...</span>,

  IonInput: ({ value, onIonInput, ...props }: any) => (
    <input
      {...props}
      value={value}
      onChange={(e) =>
        onIonInput({ detail: { value: e.target.value } })
      }
    />
  ),

  IonButton: ({ children, ...props }: any) => (
    <button
      type={props.type || "button"}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {children}
    </button>
  ),

  IonModal: ({ isOpen, children }: any) =>
    isOpen ? <div role="dialog">{children}</div> : null,
}));

const loginMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useAuth).mockReturnValue({
    user: null,
    isAuthenticated: false,
    login: loginMock,
    logout: vi.fn(),
  });
});

test("LoginPage muestra un error cuando las credenciales son incorrectas", async () => {
  // Simulamos que el servidor rechaza el inicio de sesión.
  loginMock.mockRejectedValue(
    new Error("Credenciales incorrectas")
  );

  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

  // Ingresamos las credenciales de prueba.
  fireEvent.change(screen.getByLabelText("Correo electrónico"), {
    target: { value: "vecino@correo.cl" },
  });

  fireEvent.change(screen.getByLabelText("Contraseña"), {
    target: { value: "claveincorrecta" },
  });

  // Enviamos el formulario.
  fireEvent.click(
    screen.getByRole("button", { name: "Iniciar Sesion" })
  );

  // Comprobamos que se llamó al servicio con esos datos.
  await waitFor(() => {
    expect(loginMock).toHaveBeenCalledWith(
      "vecino@correo.cl",
      "claveincorrecta"
    );
  });

  // Comprobamos que aparece el mensaje de error.
  expect(
    await screen.findByText("Credenciales incorrectas")
  ).toBeTruthy();
});

test("LoginPage redirige al vecino después de iniciar sesión correctamente", async () => {
  loginMock.mockResolvedValue({
    id: "1",
    nombre: "Usuario de prueba",
    email: "vecino@correo.cl",
    rol: "vecino",
  });

  // Este componente nos permite observar la ruta actual.
  const MostrarRuta = () => {
    const location = useLocation();
    return <div data-testid="ruta-actual">{location.pathname}</div>;
  };

  render(
    <MemoryRouter initialEntries={["/login"]}>
      <MostrarRuta />
      <Route path="/login" component={LoginPage} />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText("Correo electrónico"), {
    target: { value: "vecino@correo.cl" },
  });

  fireEvent.change(screen.getByLabelText("Contraseña"), {
    target: { value: "clave123" },
  });

  fireEvent.click(
    screen.getByRole("button", { name: "Iniciar Sesion" })
  );

  // Verificamos las credenciales enviadas.
  await waitFor(() => {
    expect(loginMock).toHaveBeenCalledWith(
      "vecino@correo.cl",
      "clave123"
    );
  });

  // Verificamos que realmente cambió la ruta.
  await waitFor(() => {
    expect(screen.getByTestId("ruta-actual").textContent)
      .toBe("/app/inicio");
  });
});


test("LoginPage redirige al administrador a su panel", async () => {
  // Simulamos una autenticación exitosa de administrador.
  loginMock.mockResolvedValue({
    id: "2",
    nombre: "Administrador de prueba",
    email: "admin@correo.cl",
    rol: "admin",
  });

  // Componente auxiliar para observar la ruta actual.
  const MostrarRuta = () => {
    const location = useLocation();
    return <div data-testid="ruta-actual">{location.pathname}</div>;
  };

  render(
    <MemoryRouter initialEntries={["/login"]}>
      <MostrarRuta />
      <Route path="/login" component={LoginPage} />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText("Correo electrónico"), {
    target: { value: "admin@correo.cl" },
  });

  fireEvent.change(screen.getByLabelText("Contraseña"), {
    target: { value: "claveadmin123" },
  });

  fireEvent.click(
    screen.getByRole("button", { name: "Iniciar Sesion" })
  );

  // Verificamos que se enviaron las credenciales.
  await waitFor(() => {
    expect(loginMock).toHaveBeenCalledWith(
      "admin@correo.cl",
      "claveadmin123"
    );
  });

  // Verificamos la redirección al panel de administración.
  await waitFor(() => {
    expect(screen.getByTestId("ruta-actual").textContent)
      .toBe("/admin/inicio");
  });
});