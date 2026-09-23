import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonButtons,
  IonMenuButton,
  IonBackButton,
  IonButton,
  IonIcon,
  IonText,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonToast,
} from "@ionic/react";
import {
  searchOutline,
  alertCircleOutline,
  timeOutline,
  checkmarkCircleOutline,
  star,
  starOutline,
  businessOutline,
  locationOutline,
  calendarOutline,
} from "ionicons/icons";
import { reportService } from "../../services/report.service";
import { IReport } from "../../types";

const ConsultaPublicaPage: React.FC = () => {
  const [folioInput, setFolioInput] = useState("");
  const [report, setReport] = useState<IReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [calificacionTemp, setCalificacionTemp] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState("");

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!folioInput.trim()) return;

    setLoading(true);
    setSearched(true);
    const result = await reportService.obtenerReclamoPorFolio(folioInput);
    setReport(result);
    if (result && result.calificacion) {
      setCalificacionTemp(result.calificacion);
    } else {
      setCalificacionTemp(0);
    }
    setLoading(false);
  };

  const handleCalificar = async (puntuacion: number) => {
    if (!report) return;
    setCalificacionTemp(puntuacion);
    await reportService.calificarRespuesta(report.folio, {
      calificacion: puntuacion,
    });
    setToastMsg(
      `¡Gracias! Has calificado la respuesta con ${puntuacion} estrellas.`,
    );
    // Refrescar datos
    const actualizado = await reportService.obtenerReclamoPorFolio(
      report.folio,
    );
    setReport(actualizado);
  };

  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "warning";
      case "En Revisión":
        return "tertiary";
      case "Derivado":
        return "primary";
      case "Resuelto":
        return "success";
      case "Rechazado":
        return "danger";
      default:
        return "medium";
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Consultar un reclamo</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          {/* Formulario de búsqueda (Figma móvil) */}
          <div className="ion-text-center ion-margin-bottom">
            <h2 style={{ fontWeight: 600 }}>
              Consulta el estado de tu reclamo
            </h2>
            <IonText color="medium">
              <p>
                Ingresa el número de folio que recibiste al realizar tu reclamo.
              </p>
            </IonText>
          </div>

          <form onSubmit={handleSearch}>
            <IonSearchbar
              value={folioInput}
              onIonInput={(e) => setFolioInput(e.detail.value!)}
              placeholder="Número de folio... (ej: SD-2026-000101)"
              showClearButton="focus"
            />
            <IonButton
              expand="block"
              type="submit"
              color="dark"
              className="ion-margin-top"
              disabled={loading || !folioInput.trim()}
            >
              {loading ? (
                <IonSpinner name="crescent" />
              ) : (
                <>
                  <IonIcon slot="start" icon={searchOutline} /> Consultar
                  reclamo
                </>
              )}
            </IonButton>
          </form>

          {/* Estado de error: Folio no encontrado (Figma móvil) */}
          {searched && !loading && !report && (
            <IonCard
              className="ion-margin-top ion-text-center"
              style={{ border: "1px solid #e0e0e0", borderRadius: "12px" }}
            >
              <IonCardContent>
                <IonIcon
                  icon={alertCircleOutline}
                  style={{
                    fontSize: "56px",
                    color: "var(--ion-color-warning)",
                  }}
                />
                <h3 style={{ fontWeight: 700, margin: "12px 0 6px 0" }}>
                  NÚMERO DE FOLIO NO ENCONTRADO
                </h3>
                <IonText color="medium">
                  <p>
                    Verifica que el número ingresado sea correcto e inténtalo
                    nuevamente.
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>
          )}

          {/* Estado de éxito: Detalle completo del reclamo */}
          {report && (
            <IonCard
              className="ion-margin-top"
              style={{
                borderRadius: "14px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
            >
              <IonCardHeader>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <IonCardTitle style={{ fontSize: "1.4rem", fontWeight: 800 }}>
                    #{report.folio}
                  </IonCardTitle>
                  <IonBadge
                    color={getBadgeColor(report.estado)}
                    style={{
                      fontSize: "13px",
                      padding: "6px 12px",
                      textTransform: "uppercase",
                    }}
                  >
                    {report.estado}
                  </IonBadge>
                </div>
                <IonCardSubtitle
                  style={{
                    marginTop: "6px",
                    fontSize: "1rem",
                    color: "var(--ion-color-dark)",
                  }}
                >
                  {report.categoria}
                </IonCardSubtitle>
              </IonCardHeader>

              <IonCardContent>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <IonIcon icon={locationOutline} color="medium" />
                    <span>
                      <strong>Ubicación:</strong> {report.ubicacion}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <IonIcon icon={calendarOutline} color="medium" />
                    <span>
                      <strong>Fecha de ingreso:</strong>{" "}
                      {new Date(report.fechaIngreso).toLocaleDateString()}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <IonIcon icon={businessOutline} color="medium" />
                    <span>
                      <strong>Unidad responsable:</strong>{" "}
                      {report.unidadAsignada || "OIRS Central"}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: "#f8f9fa",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <strong style={{ fontSize: "13px", color: "#666" }}>
                    DESCRIPCIÓN INGRESADA:
                  </strong>
                  <p style={{ margin: "4px 0 0 0", color: "#222" }}>
                    {report.descripcion}
                  </p>
                </div>

                {/* RF-04: Plazo de respuesta legal */}
                {report.estado !== "Resuelto" && (
                  <div
                    style={{
                      background: reportService.calcularDiasRestantes(
                        report.fechaIngreso,
                      ).vencido
                        ? "#ffebee"
                        : "#e3f2fd",
                      padding: "12px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "16px",
                    }}
                  >
                    <IonIcon
                      icon={timeOutline}
                      style={{ fontSize: "24px" }}
                      color={
                        reportService.calcularDiasRestantes(report.fechaIngreso)
                          .vencido
                          ? "danger"
                          : "primary"
                      }
                    />
                    <div>
                      <strong>Plazo de respuesta:</strong>
                      <p style={{ margin: 0, fontSize: "14px" }}>
                        {
                          reportService.calcularDiasRestantes(
                            report.fechaIngreso,
                          ).diasRestantes
                        }{" "}
                        días restantes (de 20 días legales)
                        {reportService.calcularDiasRestantes(
                          report.fechaIngreso,
                        ).vencido && " — ¡Plazo vencido!"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Respuesta formal si el reclamo fue resuelto (Figma) */}
                {report.respuestaFormal && (
                  <div
                    style={{
                      background: "#e8f5e9",
                      borderLeft: "4px solid #2e7d32",
                      padding: "12px",
                      borderRadius: "0 8px 8px 0",
                      marginBottom: "16px",
                    }}
                  >
                    <strong style={{ color: "#2e7d32" }}>
                      Respuesta formal de la Municipalidad:
                    </strong>
                    <p style={{ margin: "6px 0 0 0", color: "#1b5e20" }}>
                      {report.respuestaFormal}
                    </p>
                  </div>
                )}

                {/* RF-09: Califica nuestra respuesta (Solo cuando está Resuelto - Figma móvil) */}
                {report.estado === "Resuelto" && (
                  <div
                    className="ion-text-center"
                    style={{
                      borderTop: "1px solid #eee",
                      paddingTop: "16px",
                      marginTop: "16px",
                    }}
                  >
                    <h4 style={{ fontWeight: 600, marginBottom: "6px" }}>
                      Califica nuestra respuesta
                    </h4>
                    <p
                      style={{ fontSize: "13px", color: "#666", marginTop: 0 }}
                    >
                      ¿Qué tan satisfecho quedaste con la solución municipal?
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "8px",
                        margin: "10px 0",
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((estrella) => (
                        <IonButton
                          key={estrella}
                          fill="clear"
                          size="large"
                          onClick={() => handleCalificar(estrella)}
                        >
                          <IonIcon
                            slot="icon-only"
                            icon={
                              calificacionTemp >= estrella ? star : starOutline
                            }
                            color={
                              calificacionTemp >= estrella
                                ? "warning"
                                : "medium"
                            }
                          />
                        </IonButton>
                      ))}
                    </div>
                  </div>
                )}

                {/* RNF-05: Historial del reclamo (Línea de tiempo) */}
                <h4
                  style={{
                    fontWeight: 700,
                    marginTop: "20px",
                    marginBottom: "8px",
                  }}
                >
                  Historial del reclamo
                </h4>
                <IonList lines="full">
                  {report.historial.map((item, idx) => (
                    <IonItem key={idx} className="ion-no-padding">
                      <IonIcon
                        icon={checkmarkCircleOutline}
                        slot="start"
                        color="primary"
                        style={{ fontSize: "20px" }}
                      />
                      <IonLabel>
                        <h3 style={{ fontWeight: 600 }}>{item.estado}</h3>
                        <p>{item.observacion}</p>
                        <IonText color="medium">
                          <small>{new Date(item.fecha).toLocaleString()}</small>
                        </IonText>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>
          )}
        </div>

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={3000}
          onDidDismiss={() => setToastMsg("")}
        />
      </IonContent>
    </IonPage>
  );
};

export default ConsultaPublicaPage;
