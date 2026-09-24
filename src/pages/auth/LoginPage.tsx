import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonModal,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { alertCircleOutline } from "ionicons/icons";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.service";

const LoginPage: React.FC = () => {
  // Datos del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const history = useHistory();
  const { login } = useAuth();

  // Envia el login y valida credenciales
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const usuario = authService.login(email.trim().toLowerCase(), password);

    if (!usuario) {
      setErrorModal("Correo o usuario incorrecto, intentelo nuevamente.");
      return;
    }

    login(usuario.email, password, usuario.rol);

    // Redireccion segun el rol del usuario
    if (usuario.rol === "admin") {
      history.push("/admin/inicio");
    } else {
      history.push("/app/inicio");
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" style={{ "--background": "#F8FAFC" }}>
        <div
          style={{
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 10px",
          }}
        >
          <IonCard
            style={{
              width: "100%",
              maxWidth: "410px",
              borderRadius: "16px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 18px rgba(0, 0, 0, 0.04)",
              overflow: "hidden",
              margin: "0",
              padding: "0",
            }}
          >
            {/* Franja superior tricolor */}
            <div
              style={{
                height: "5px",
                width: "100%",
                background:
                  "linear-gradient(90deg, #0D3B66 0%, #2E7D32 60%, #F59E0B 100%)",
              }}
            />

            <IonCardContent style={{ padding: "24px 20px" }}>
              {/* Logo e identidad municipal */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <img
                  src="/logo-santodomingo.png"
                  alt="Municipalidad de Santo Domingo"
                  style={{
                    maxHeight: "110px",
                    maxWidth: "240px",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    margin: "0 auto 12px auto",
                    display: "block",
                  }}
                />

                <h1
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    color: "#0D3B66",
                    margin: "0",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  MUNICIPALIDAD DE SANTO DOMINGO
                </h1>

                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748B",
                    margin: "4px 0 0 0",
                  }}
                >
                  Plataforma de Atencion y Reclamos Vecinales
                </p>
              </div>

              {/* Formulario */}
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: "14px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#334155",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Correo Electronico
                  </label>
                  <div
                    style={{
                      border: "1px solid #CBD5E1",
                      borderRadius: "8px",
                      padding: "2px 10px",
                      background: "#FFFFFF",
                    }}
                  >
                    <IonInput
                      type="email"
                      value={email}
                      placeholder="ejemplo@correo.cl"
                      required
                      onIonInput={(e) => setEmail(e.detail.value!)}
                      style={{ "--padding-start": "0", fontSize: "14px" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#334155",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Contraseña
                  </label>
                  <div
                    style={{
                      border: "1px solid #CBD5E1",
                      borderRadius: "8px",
                      padding: "2px 10px",
                      background: "#FFFFFF",
                    }}
                  >
                    <IonInput
                      type="password"
                      value={password}
                      placeholder="••••••••"
                      required
                      onIonInput={(e) => setPassword(e.detail.value!)}
                      style={{ "--padding-start": "0", fontSize: "14px" }}
                    />
                  </div>
                </div>

                {/* Enlace para recuperar clave */}
                <div style={{ textAlign: "right", marginBottom: "18px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#0D3B66",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                    onClick={() =>
                      alert(
                        "Modulo de recuperacion disponible en la siguiente entrega.",
                      )
                    }
                  >
                    ¿Olvidaste tu contraseña?
                  </span>
                </div>

                {/* Boton principal de acceso */}
                <IonButton
                  expand="block"
                  type="submit"
                  style={{
                    "--background": "#0D3B66",
                    "--border-radius": "8px",
                    height: "46px",
                    fontWeight: 600,
                    fontSize: "14px",
                    margin: "0 0 10px 0",
                  }}
                >
                  Iniciar Sesion
                </IonButton>

                {/* Boton para ir a registrarse */}
                <IonButton
                  expand="block"
                  fill="outline"
                  onClick={() => history.push("/registro")}
                  style={{
                    "--border-color": "#0D3B66",
                    "--color": "#0D3B66",
                    "--border-radius": "8px",
                    height: "44px",
                    fontWeight: 600,
                    fontSize: "14px",
                    margin: "0 0 14px 0",
                  }}
                >
                  Registrarse
                </IonButton>

                {/* Consulta rapida sin sesion */}
                <div
                  style={{
                    textAlign: "center",
                    borderTop: "1px solid #F1F5F9",
                    paddingTop: "12px",
                  }}
                >
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => history.push("/consulta")}
                    style={{
                      "--color": "#0D3B66",
                      fontSize: "13px",
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Consultar reclamo sin iniciar sesion
                  </IonButton>
                </div>
              </form>
            </IonCardContent>
          </IonCard>

          {/* Modal de error con icono amarillo institucional */}
          <IonModal
            isOpen={!!errorModal}
            onDidDismiss={() => setErrorModal(null)}
            style={{
              "--height": "auto",
              "--width": "320px",
              "--border-radius": "14px",
            }}
          >
            <div
              style={{
                padding: "24px 20px",
                textAlign: "center",
                background: "#FFFFFF",
              }}
            >
              <IonIcon
                icon={alertCircleOutline}
                style={{
                  fontSize: "48px",
                  color: "#F59E0B",
                  marginBottom: "8px",
                }}
              />
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontWeight: 700,
                  color: "#0F172A",
                  fontSize: "16px",
                }}
              >
                Atencion
              </h3>
              <p
                style={{
                  margin: "0 0 18px 0",
                  color: "#64748B",
                  fontSize: "13px",
                }}
              >
                {errorModal}
              </p>
              <IonButton
                expand="block"
                onClick={() => setErrorModal(null)}
                style={{
                  "--background": "#1E293B",
                  "--border-radius": "8px",
                  height: "40px",
                  fontWeight: 600,
                }}
              >
                Entendido
              </IonButton>
            </div>
          </IonModal>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
