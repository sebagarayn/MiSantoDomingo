// Importa React y el hook useState para manejar el estado local (variables reactivas) del componente.
import React, { useState } from "react";
// Importa los componentes UI nativos de Ionic necesarios para estructurar la vista y los formularios.
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonButtons,
  IonBackButton,
} from "@ionic/react";
// Importa el hook de enrutamiento de React Router para redirigir al usuario programáticamente.
import { useHistory } from "react-router-dom";

// Define el componente funcional de React para la vista de Registro.
const Registro: React.FC = () => {
  // Inicializa los estados locales para capturar la entrada del usuario en el formulario.
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Instancia el objeto history para poder ejecutar cambios de ruta.
  const history = useHistory();

  // Función manejadora que se ejecuta al enviar el formulario (submit).
  const handleRegistro = (e: React.FormEvent) => {
    // Previene el comportamiento por defecto de recargar la página en los formularios HTML.
    e.preventDefault();
    // TODO: Integrar lógica de creación de usuario en EP2 (ej. llamada POST al backend).
    // Simula el flujo redirigiendo al usuario a la vista de login tras "registrarse".
    history.push("/login");
  };

  return (
    // Contenedor principal de la vista en Ionic. Obligatorio para el enrutamiento y transiciones.
    <IonPage>
      {/* Cabecera superior de la aplicación. */}
      <IonHeader>
        <IonToolbar color="primary">
          {/* Contenedor alineado a la izquierda (start) para ubicar el botón de regreso. */}
          <IonButtons slot="start">
            {/* Botón de retroceso nativo. defaultHref asegura que vuelva a /login si no hay historial. */}
            <IonBackButton defaultHref="/login" />
          </IonButtons>
          <IonTitle>Registro de Vecino</IonTitle>
        </IonToolbar>
      </IonHeader>

      {/* Contenedor principal scrolleable. ion-padding aplica un margen interior estandarizado. */}
      <IonContent className="ion-padding">
        {/* Sistema de grilla flexible de Ionic (Flexbox). */}
        <IonGrid>
          {/* Fila con contenido centrado horizontalmente. */}
          <IonRow className="ion-justify-content-center">
            {/* Columna responsiva: Ocupa 100% en móvil (size="12"), 50% en tablet (sizeMd="6") y 33% en escritorio (sizeLg="4"). */}
            <IonCol size="12" sizeMd="6" sizeLg="4">
              {/* Tarjeta UI para agrupar el formulario con relieve y bordes redondeados. */}
              <IonCard>
                <IonCardContent>
                  {/* Formulario enlazado al evento onSubmit. */}
                  <form onSubmit={handleRegistro}>
                    {/* Campo de texto (Input) controlado por React. */}
                    <IonInput
                      label="Nombre Completo"
                      labelPlacement="floating" // El label se anima hacia arriba al enfocar el campo.
                      type="text"
                      required // Validación HTML nativa.
                      value={nombre} // Enlaza el valor del input al estado local.
                      onIonInput={(e) => setNombre(e.detail.value!)} // Actualiza el estado en cada pulsación.
                      className="ion-margin-bottom" // Clase utilitaria de CSS nativo de Ionic para el margen inferior.
                    />
                    {/* Campo de correo electrónico controlado. */}
                    <IonInput
                      label="Correo Electrónico"
                      labelPlacement="floating"
                      type="email" // Activa el teclado con '@' en dispositivos móviles.
                      required
                      value={email}
                      onIonInput={(e) => setEmail(e.detail.value!)}
                      className="ion-margin-bottom"
                    />
                    {/* Campo de contraseña controlado. */}
                    <IonInput
                      label="Contraseña"
                      labelPlacement="floating"
                      type="password" // Oculta los caracteres ingresados.
                      required
                      value={password}
                      onIonInput={(e) => setPassword(e.detail.value!)}
                      className="ion-margin-bottom"
                    />
                    {/* Botón de envío del formulario. expand="block" hace que ocupe el ancho total del contenedor. */}
                    <IonButton
                      type="submit"
                      expand="block"
                      className="ion-margin-top"
                    >
                      Crear Cuenta
                    </IonButton>
                  </form>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

// Exporta el componente para ser utilizado en el enrutador (App.tsx).
export default Registro;
