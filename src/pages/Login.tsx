// Importación de React y el hook useState para gestionar el estado local del componente.
import React, { useState } from "react";
// Importación de los componentes de UI nativos de Ionic utilizados en la vista.
import {
  IonPage, // Envoltura base de cualquier vista en Ionic (requerido para navegación y transiciones).
  IonHeader, // Contenedor superior para la barra de herramientas.
  IonToolbar, // Barra de herramientas que aloja el título.
  IonTitle, // Componente de texto para el título de la página.
  IonContent, // Contenedor principal scrolleable.
  IonInput, // Campo de entrada de datos interactivo.
  IonButton, // Botón interactivo.
  IonGrid, // Contenedor del sistema de grilla (Flexbox).
  IonRow, // Fila de la grilla.
  IonCol, // Columna responsiva de la grilla.
  IonCard, // Contenedor tipo tarjeta con sombras y bordes redondeados.
  IonCardContent, // Contenedor interior de la tarjeta con padding predeterminado.
} from "@ionic/react";
// Importación del hook de enrutamiento para redirecciones programáticas.
import { useHistory } from "react-router-dom";

// Definición del componente funcional Login.
const Login: React.FC = () => {
  // Estados locales para almacenar el email y contraseña introducidos por el usuario.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Inicialización del objeto history para controlar la navegación.
  const history = useHistory();

  // Función manejadora del evento submit del formulario.
  const handleLogin = (e: React.FormEvent) => {
    // Evita la recarga completa de la página (comportamiento HTML por defecto).
    e.preventDefault();
    // TODO: Integrar lógica de auth real en EP2.
    // Simulación de redirección por defecto hacia la vista privada del vecino.
    history.push("/vecino/reclamos");
  };

  return (
    // Raíz de la vista.
    <IonPage>
      {/* Cabecera de la aplicación */}
      <IonHeader>
        {/* Toolbar configurada con el color primario del tema de Ionic */}
        <IonToolbar color="primary">
          <IonTitle>Iniciar Sesión</IonTitle>
        </IonToolbar>
      </IonHeader>

      {/* Área de contenido principal. ion-padding aplica un margen interno global. */}
      <IonContent className="ion-padding">
        {/* Grilla forzada a ocupar el 100% de la altura disponible para permitir el centrado vertical */}
        <IonGrid style={{ height: "100%" }}>
          {/* Fila con clases utilitarias de Ionic para centrado absoluto (horizontal y vertical) */}
          <IonRow
            className="ion-justify-content-center ion-align-items-center"
            style={{ height: "100%" }}
          >
            {/* Columna responsiva: 100% en móvil (12), 50% en tablet (6), 33.3% en escritorio (4) */}
            <IonCol size="12" sizeMd="6" sizeLg="4">
              <IonCard>
                <IonCardContent>
                  {/* Formulario enlazado a la función handleLogin */}
                  <form onSubmit={handleLogin}>
                    {/* Campo de correo. La etiqueta 'floating' se anima al recibir foco. */}
                    <IonInput
                      label="Correo Electrónico"
                      labelPlacement="floating"
                      type="email"
                      required
                      value={email} // Valor atado al estado reactivo
                      onIonInput={(e) => setEmail(e.detail.value!)} // Actualiza el estado con la entrada del usuario
                      className="ion-margin-bottom" // Clase utilitaria para margen inferior
                    />
                    {/* Campo de contraseña. type="password" oculta el texto. */}
                    <IonInput
                      label="Contraseña"
                      labelPlacement="floating"
                      type="password"
                      required
                      value={password}
                      onIonInput={(e) => setPassword(e.detail.value!)}
                      className="ion-margin-bottom"
                    />
                    {/* Botón principal (submit). expand="block" hace que ocupe el ancho completo de la tarjeta. */}
                    <IonButton
                      type="submit"
                      expand="block"
                      className="ion-margin-top"
                    >
                      Ingresar
                    </IonButton>
                    {/* Botón de enlace a registro. fill="clear" le quita el fondo para que parezca un texto enlazado. */}
                    <IonButton
                      expand="block"
                      fill="clear"
                      onClick={() => history.push("/registro")}
                    >
                      ¿No tienes cuenta? Regístrate
                    </IonButton>
                    {/* Botón para flujo sin cuenta. color="medium" aplica un tono grisáceo. */}
                    <IonButton
                      expand="block"
                      fill="clear"
                      color="medium"
                      onClick={() => history.push("/consulta")}
                    >
                      Consultar Reclamo sin cuenta
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

// Exportación del componente.
export default Login;
