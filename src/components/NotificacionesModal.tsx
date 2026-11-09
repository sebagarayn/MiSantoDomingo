import React from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonText,
} from "@ionic/react";
import {
  closeOutline,
  checkmarkDoneOutline,
  notificationsOutline,
  notificationsOffOutline,
} from "ionicons/icons";
import { INotificacion } from "../types";

// Todo lo que necesita el modal llega por props: no consulta la API por su cuenta
interface NotificacionesModalProps {
  abierto: boolean;
  onCerrar: () => void;
  notificaciones: INotificacion[];
  noLeidas: number;
  error: string;
  onMarcarLeida: (id: number) => void;
  onMarcarTodas: () => void;
  onReintentar: () => void;
}

// Convierte la fecha ISO de PostgreSQL en algo legible: "09-11-2026, 01:34"
const formatearFecha = (iso: string): string =>
  new Date(iso).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const NotificacionesModal: React.FC<NotificacionesModalProps> = ({
  abierto,
  onCerrar,
  notificaciones,
  noLeidas,
  error,
  onMarcarLeida,
  onMarcarTodas,
  onReintentar,
}) => {
  return (
    <IonModal isOpen={abierto} onDidDismiss={onCerrar}>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ "--background": "#0D3B66" }}>
          <IonTitle
            style={{
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "14px",
              textTransform: "uppercase",
            }}
          >
            Notificaciones
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={onCerrar}
              style={{ color: "#FFFFFF" }}
              aria-label="Cerrar notificaciones"
            >
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
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

      <IonContent style={{ "--background": "#F8FAFC" }}>
        {/* Barra con el resumen y el boton "marcar todas" (solo si hay algo por leer) */}
        {noLeidas > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 16px",
              borderBottom: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
            }}
          >
            <IonText color="medium" style={{ fontSize: "13px" }}>
              {noLeidas === 1 ? "1 sin leer" : `${noLeidas} sin leer`}
            </IonText>
            <IonButton size="small" fill="clear" onClick={onMarcarTodas}>
              <IonIcon slot="start" icon={checkmarkDoneOutline} />
              Marcar todas como leídas
            </IonButton>
          </div>
        )}

        {/* Error de carga: se explica y se ofrece reintentar */}
        {error && (
          <div style={{ padding: "16px", textAlign: "center" }}>
            <IonText color="danger" style={{ fontSize: "13px" }}>
              {error}
            </IonText>
            <div>
              <IonButton size="small" fill="outline" onClick={onReintentar}>
                Reintentar
              </IonButton>
            </div>
          </div>
        )}

        {/* Estado vacio */}
        {!error && notificaciones.length === 0 && (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              color: "#64748B",
            }}
          >
            <IonIcon
              icon={notificationsOffOutline}
              style={{ fontSize: "48px", marginBottom: "8px" }}
            />
            <p style={{ margin: 0, fontWeight: 600 }}>
              No tienes notificaciones
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "13px" }}>
              Te avisaremos cuando cambie el estado de uno de tus reclamos.
            </p>
          </div>
        )}

        {/* Lista: las no leidas se ven en negrita y con fondo suave */}
        {notificaciones.length > 0 && (
          <IonList lines="full" style={{ padding: 0 }}>
            {notificaciones.map((n) => (
              <IonItem
                key={n.id_notificacion}
                button
                detail={false}
                onClick={() => !n.leida && onMarcarLeida(n.id_notificacion)}
                style={{
                  "--background": n.leida ? "#FFFFFF" : "#EFF6FF",
                }}
              >
                <IonIcon
                  slot="start"
                  icon={notificationsOutline}
                  style={{ color: n.leida ? "#94A3B8" : "#0D3B66" }}
                />
                <IonLabel className="ion-text-wrap">
                  <h3 style={{ fontWeight: n.leida ? 400 : 700 }}>
                    {n.mensaje}
                  </h3>
                  <p>
                    {n.folio} · {formatearFecha(n.creado_en)}
                  </p>
                </IonLabel>
                {!n.leida && (
                  <IonNote slot="end" color="primary" aria-label="Sin leer">
                    ●
                  </IonNote>
                )}
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonModal>
  );
};

export default NotificacionesModal;