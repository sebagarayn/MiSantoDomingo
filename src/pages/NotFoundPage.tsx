import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { homeOutline, alertCircleOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";

// Pantalla 404 por si alguien escribe una ruta que no existe en el navegador
const NotFoundPage: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      {/* Cabecera institucional azul */}
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ "--background": "#0D3B66", padding: "4px 0" }}>
          <IonTitle
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "#FFFFFF",
              textTransform: "uppercase",
            }}
          >
            Página No Encontrada
          </IonTitle>
        </IonToolbar>
        <div
          style={{
            height: "3px",
            width: "100%",
            background:
              "linear-gradient(90deg, #0D3B66 0%, #2E7D32 50%, #F59E0B 100%)",
          }}
        />
      </IonHeader>

      <IonContent className="ion-padding" style={{ "--background": "#F8FAFC" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80%",
            maxWidth: "420px",
            margin: "0 auto",
          }}
        >
          {/* Tarjeta de error 404 */}
          <IonCard
            style={{
              borderRadius: "16px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              textAlign: "center",
              padding: "24px 16px",
              width: "100%",
            }}
          >
            <IonCardContent>
              <IonIcon
                icon={alertCircleOutline}
                style={{
                  fontSize: "56px",
                  color: "#F59E0B",
                  marginBottom: "8px",
                }}
              />
              <h1
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 800,
                  color: "#0D3B66",
                  margin: "0 0 4px 0",
                }}
              >
                404
              </h1>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#0F172A",
                  margin: "0 0 6px 0",
                }}
              >
                Página no encontrada
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  color: "#64748B",
                  margin: "0 0 20px 0",
                }}
              >
                La dirección que intentas abrir no existe o fue movida.
              </p>

              {/* Boton para regresar a salvo */}
              <IonButton
                expand="block"
                onClick={() => history.push("/")}
                style={{
                  "--background": "#0D3B66",
                  "--border-radius": "8px",
                  height: "44px",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                <IonIcon slot="start" icon={homeOutline} />
                Volver al inicio
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NotFoundPage;
