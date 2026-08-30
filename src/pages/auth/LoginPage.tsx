import { useState } from "react";
import { IonContent, IonPage, IonInput, IonButton } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { login as buscarUsuario } from "../../services/auth.service";
import "./auth.css";

const LoginPage: React.FC = () => {
  const history = useHistory();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Login simulado con el servicio mock
  const manejarLogin = async () => {
    const usuario = buscarUsuario(email, password);

    if (!usuario) {
      setMensaje("Correo o contraseña incorrectos");
      return;
    }

    await login(email, password, usuario.rol);
    history.push(usuario.rol === "admin" ? "/admin/inicio" : "/app/inicio");
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="contenedor-central">
          <h1 className="titulo">¡Bienvenido!</h1>
          <p className="subtitulo">Inicia sesión con tu cuenta</p>

          <IonInput
            className="campo"
            type="email"
            placeholder="Email"
            aria-label="Email"
            value={email}
            onIonChange={(e) => setEmail(e.detail.value || "")}
          />

          <IonInput
            className="campo"
            type="password"
            placeholder="Contraseña"
            aria-label="Contraseña"
            value={password}
            onIonChange={(e) => setPassword(e.detail.value || "")}
          />

          {mensaje !== "" && <p className="mensaje-error">{mensaje}</p>}

          <IonButton className="boton-principal" onClick={manejarLogin}>
            Iniciar sesión
          </IonButton>

          <a className="link" href="#">
            Olvidaste tu contraseña?
          </a>

          <p className="texto-cuenta">No tienes una cuenta?</p>

          <IonButton
            className="boton-principal"
            onClick={() => history.push("/registro")}
          >
            Crear cuenta
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
