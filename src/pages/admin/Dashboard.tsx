import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';

const KPIS = [
  { label: 'Reclamos ingresados', valor: '365' },
  { label: 'Tiempo promedio de respuesta', valor: '7 días' },
  { label: 'Reclamos vencidos', valor: '3' },
];

export default function Dashboard() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            {KPIS.map((k) => (
              <IonCol key={k.label} size="12" sizeMd="4">
                <IonCard>
                  <IonCardHeader><IonCardTitle>{k.valor}</IonCardTitle></IonCardHeader>
                  <IonCardContent>{k.label}</IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
}