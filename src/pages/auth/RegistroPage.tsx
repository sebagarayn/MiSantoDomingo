import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonToast,
  IonModal,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { alertCircleOutline } from "ionicons/icons";

const RegistroPage: React.FC = () => {
  // Datos del formulario de registro
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const history = useHistory();

  // Valida los campos antes de registrar
  const handleRegistro = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !email.trim() || !password.trim()) {
      setErrorModal("Por favor complete todos los campos obligatorios.");
      return;
    }

    if (password.length < 6) {
      setErrorModal("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setToastMsg("Cuenta creada con exito. Redirigiendo al inicio de sesion...");
    setTimeout(() => {
      history.push("/login");
    }, 1500);
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
            {/* Franja superior tricolor Santo Domingo */}
            <div
              style={{
                height: "5px",
                width: "100%",
                background:
                  "linear-gradient(90deg, #0D3B66 0%, #2E7D32 60%, #F59E0B 100%)",
              }}
            />

            <IonCardContent style={{ padding: "24px 20px" }}>
              {/* Logo y encabezado */}
              <div style={{ textAlign: "center", marginBottom: "22px" }}>
                <img
                  src="/logo-santodomingo.png"
                  alt="Municipalidad de Santo Domingo"
                  style={{
                    maxHeight: "100px",
                    maxWidth: "220px",
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
                  Registro de Vecino / Cuenta Ciudadana
                </p>
              </div>

              {/* Formulario de registro */}
              <form onSubmit={handleRegistro}>
                <div style={{ marginBottom: "12px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#334155",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Nombre Completo
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
                      value={nombre}
                      placeholder="Ej: Maria Gonzalez"
                      required
                      onIonInput={(e) => setNombre(e.detail.value!)}
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
                      marginBottom: "4px",
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
                      marginBottom: "4px",
                    }}
                  >
                    Telefono de Contacto (Opcional)
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
                      type="tel"
                      value={telefono}
                      placeholder="+56 9 1234 5678"
                      onIonInput={(e) => setTelefono(e.detail.value!)}
                      style={{ "--padding-start": "0", fontSize: "14px" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#334155",
                      display: "block",
                      marginBottom: "4px",
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
                      placeholder="Minimo 6 caracteres"
                      required
                      onIonInput={(e) => setPassword(e.detail.value!)}
                      style={{ "--padding-start": "0", fontSize: "14px" }}
                    />
                  </div>
                </div>

                {/* Boton para crear cuenta */}
                {/* Boton con el azul municipal unificado */}
                <IonButton
                  expand="block"
                  type="submit"
                  style={{
                    "--background": "#0D3B66",
                    "--border-radius": "8px",
                    height: "46px",
                    fontWeight: 600,
                    fontSize: "14px",
                    marginBottom: "10px",
                  }}
                >
                  Crear Cuenta
                </IonButton>

                <IonButton
                  expand="block"
                  fill="clear"
                  onClick={() => history.push("/login")}
                  style={{
                    "--color": "#0D3B66",
                    fontSize: "13px",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  ¿Ya tienes cuenta? Iniciar Sesion
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>

          {/* Modal de error con icono amarillo */}
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

          <IonToast
            isOpen={!!toastMsg}
            message={toastMsg}
            duration={2000}
            onDidDismiss={() => setToastMsg("")}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RegistroPage;
