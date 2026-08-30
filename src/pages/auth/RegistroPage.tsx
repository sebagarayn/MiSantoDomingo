import { useState } from "react";
import { IonContent, IonPage, IonInput, IonButton } from "@ionic/react";
import { useHistory } from "react-router-dom";
import "./auth.css";

const RegistroPage: React.FC = () => {
  const history = useHistory();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Registro simulado: solo valida campos completos por ahora
  const manejarRegistro = () => {
    if (nombre === "" || email === "" || telefono === "" || password === "") {
      setMensaje("Debes completar todos los campos");
      return;
    }

    // Aqui se creara el usuario cuando exista el backend (EP2)
    history.push("/login");
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="contenedor-central">
          <h1 className="titulo">Registrarse</h1>
          <p className="subtitulo">Ingresa los datos de tu cuenta</p>

          <IonInput
            className="campo"
            placeholder="Nombre"
            aria-label="Nombre"
            value={nombre}
            onIonChange={(e) => setNombre(e.detail.value || "")}
          />
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
            type="tel"
            placeholder="Número de teléfono"
            aria-label="Número de teléfono"
            value={telefono}
            onIonChange={(e) => setTelefono(e.detail.value || "")}
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

          <IonButton className="boton-principal" onClick={manejarRegistro}>
            Registrarse
          </IonButton>

          <p className="texto-cuenta">Ya tienes una cuenta?</p>

          <IonButton
            className="boton-principal"
            onClick={() => history.push("/login")}
          >
            Iniciar sesión
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RegistroPage;
