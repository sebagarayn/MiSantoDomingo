import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

const ConsultaPublicaPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Consulta Pública</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="ion-padding">
          <p>Consulta de reclamos mediante folio</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ConsultaPublicaPage;
