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
  // Variables locales del formulario para capturar los datos y controlar las alertas
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const history = useHistory();

  // Validamos cada campo por separado para que la alerta le diga al usuario exactamente que le falto
  const handleRegistro = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Revisamos que el nombre no venga vacio ni con puros espacios
    if (!nombre.trim()) {
      setErrorModal("Por favor ingrese su nombre completo.");
      return;
    }

    // 2. Revisamos el correo y exigimos que tenga '@' y un punto para que sea un formato valido
    if (!email.trim()) {
      setErrorModal("Por favor ingrese su correo electrónico.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setErrorModal(
        "Por favor ingrese un correo electrónico válido (ejemplo: usuario@correo.cl).",
      );
      return;
    }

    // 3. Revisamos la contrasena y exigimos un largo minimo de 6 caracteres por seguridad
    if (!password.trim()) {
      setErrorModal("Por favor ingrese una contraseña.");
      return;
    }
    if (password.length < 6) {
      setErrorModal(
        "La contraseña debe tener al menos 6 caracteres por seguridad.",
      );
      return;
    }

    // Si pasa todas las validaciones simulamos el alta con un toast y lo mandamos al login
    setToastMsg("Cuenta creada con éxito. Redirigiendo al inicio de sesión...");
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
          {/* Tarjeta central blanca de registro */}
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
            {/* Franja tricolor */}
            <div
              style={{
                height: "5px",
                width: "100%",
                background:
                  "linear-gradient(90deg, #0D3B66 0%, #2E7D32 60%, #F59E0B 100%)",
              }}
            />

            <IonCardContent style={{ padding: "24px 20px" }}>
              {/* Logo institucional y encabezado */}
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
                {/* Campo nombre completo */}
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
                    Nombre Completo (*)
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
                      onIonInput={(e) => setNombre(e.detail.value!)}
                      style={{ "--padding-start": "0", fontSize: "14px" }}
                    />
                  </div>
                </div>

                {/* Campo correo electronico */}
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
                    Correo Electrónico (*)
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
                      onIonInput={(e) => setEmail(e.detail.value!)}
                      style={{ "--padding-start": "0", fontSize: "14px" }}
                    />
                  </div>
                </div>

                {/* Campo telefono: lo dejamos opcional para cumplir con no pedir datos innecesarios segun la pauta */}
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
                    Teléfono de Contacto (Opcional)
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

                {/* Campo contrasena con largo minimo indicado */}
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
                    Contraseña (*)
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
                      placeholder="Mínimo 6 caracteres"
                      onIonInput={(e) => setPassword(e.detail.value!)}
                      style={{ "--padding-start": "0", fontSize: "14px" }}
                    />
                  </div>
                </div>

                {/* Boton principal en azul */}
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

                {/* Enlace para volver al login */}
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
                  ¿Ya tienes cuenta? Iniciar Sesión
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>

          {/* Modal con mensaje de error si falta algun campo obligatorio */}
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
                Atención
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
                  "--background": "#0D3B66",
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
