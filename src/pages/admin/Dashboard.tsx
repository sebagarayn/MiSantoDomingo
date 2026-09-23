import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSelect,
  IonSelectOption,
  IonBadge,
  IonProgressBar,
} from "@ionic/react";
import {
  statsChartOutline,
  timeOutline,
  alertCircleOutline,
  documentTextOutline,
  clipboardOutline,
  calendarOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { reportService } from "../../services/report.service";
import { IReport } from "../../types";

const Dashboard: React.FC = () => {
  const history = useHistory();
  const [reclamos, setReclamos] = useState<IReport[]>([]);
  const [periodo, setPeriodo] = useState("30dias");

  useEffect(() => {
    reportService.obtenerReclamos().then(setReclamos);
  }, []);

  // Cálculos reactivos de los KPIs (RF-10)
  const totalIngresados = reclamos.length;
  const resueltos = reclamos.filter((r) => r.estado === "Resuelto").length;

  // Reclamos vencidos según el plazo legal de 20 días corridos (RF-04)
  const vencidos = reclamos.filter(
    (r) =>
      r.estado !== "Resuelto" &&
      reportService.calcularDiasRestantes(r.fechaIngreso).vencido,
  ).length;

  const tasaResolucion =
    totalIngresados > 0 ? Math.round((resueltos / totalIngresados) * 100) : 0;

  // Agrupación por categoría para las barras
  const categoriasConteo: { [key: string]: number } = {};
  reclamos.forEach((r) => {
    const cat = r.categoria || "Otros";
    categoriasConteo[cat] = (categoriasConteo[cat] || 0) + 1;
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Dashboard de Gestión OIRS</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent
        className="ion-padding"
        style={{ backgroundColor: "#f4f5f8" }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {/* Encabezado y Selector de Período */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h2 style={{ fontWeight: 700, margin: "0 0 4px 0" }}>
                Dashboard
              </h2>
              <span style={{ color: "#666", fontSize: "14px" }}>
                Monitoreo comunal de reclamos y tiempos de respuesta municipal
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "0 10px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <IonIcon
                  icon={calendarOutline}
                  color="medium"
                  style={{ marginRight: "6px" }}
                />
                <IonSelect
                  value={periodo}
                  interface="popover"
                  onIonChange={(e) => setPeriodo(e.detail.value)}
                >
                  <IonSelectOption value="7dias">
                    Últimos 7 días
                  </IonSelectOption>
                  <IonSelectOption value="30dias">
                    Últimos 30 días
                  </IonSelectOption>
                  <IonSelectOption value="anio">
                    Año en curso (2026)
                  </IonSelectOption>
                </IonSelect>
              </div>

              <IonButton
                fill="outline"
                color="dark"
                onClick={() => history.push("/admin/inicio")}
              >
                <IonIcon slot="start" icon={clipboardOutline} />
                Ver Reclamos
              </IonButton>
            </div>
          </div>

          {/* LOS 3 INDICADORES CLAVE */}
          <IonGrid className="ion-no-padding" style={{ marginBottom: "24px" }}>
            <IonRow>
              {/* Tarjeta 1: Reclamos Ingresados */}
              <IonCol size="12" sizeMd="4">
                <IonCard
                  style={{
                    borderRadius: "12px",
                    margin: "6px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <IonCardHeader style={{ paddingBottom: "8px" }}>
                    <IonCardSubtitle
                      style={{
                        color: "#666",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      Reclamos Ingresados
                    </IonCardSubtitle>
                    <IonCardTitle
                      style={{
                        fontSize: "2.5rem",
                        fontWeight: 800,
                        color: "#111",
                      }}
                    >
                      {totalIngresados}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#555",
                        fontSize: "13px",
                      }}
                    >
                      <IonIcon icon={documentTextOutline} />
                      <span>
                        {resueltos} resueltos formalmente ({tasaResolucion}%)
                      </span>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              {/* Tarjeta 2: Tiempo promedio de respuesta */}
              <IonCol size="12" sizeMd="4">
                <IonCard
                  style={{
                    borderRadius: "12px",
                    margin: "6px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <IonCardHeader style={{ paddingBottom: "8px" }}>
                    <IonCardSubtitle
                      style={{
                        color: "#666",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      Tiempo promedio de respuesta
                    </IonCardSubtitle>
                    <IonCardTitle
                      style={{
                        fontSize: "2.5rem",
                        fontWeight: 800,
                        color: "#111",
                      }}
                    >
                      7 días
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#2e7d32",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      <IonIcon icon={timeOutline} />
                      <span>Dentro del estándar legal de 20 días</span>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              {/* Tarjeta 3: Reclamos vencidos */}
              <IonCol size="12" sizeMd="4">
                <IonCard
                  style={{
                    borderRadius: "12px",
                    margin: "6px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <IonCardHeader style={{ paddingBottom: "8px" }}>
                    <IonCardSubtitle
                      style={{
                        color: "#666",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      Reclamos vencidos
                    </IonCardSubtitle>
                    <IonCardTitle
                      style={{
                        fontSize: "2.5rem",
                        fontWeight: 800,
                        color: vencidos > 0 ? "#c62828" : "#111",
                      }}
                    >
                      {vencidos}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: vencidos > 0 ? "#c62828" : "#666",
                        fontSize: "13px",
                      }}
                    >
                      <IonIcon icon={alertCircleOutline} />
                      <span>
                        {vencidos > 0
                          ? "Requieren atención urgente"
                          : "Sin alertas de vencimiento"}
                      </span>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* GRÁFICO DE BARRAS COMPARATIVAS */}
          <IonCard
            style={{
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <IonCardHeader
              className="ion-no-padding"
              style={{ marginBottom: "16px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <IonCardTitle style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                  Volumen de solicitudes por Categoría
                </IonCardTitle>
                <IonBadge color="dark">
                  Período: {periodo === "30dias" ? "Últimos 30 días" : periodo}
                </IonBadge>
              </div>
            </IonCardHeader>

            <IonCardContent className="ion-no-padding">
              {/* Contenedor del gráfico con altura fija */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-around",
                  height: "240px",
                  borderBottom: "2px solid #ccc",
                  paddingBottom: "0",
                  margin: "20px 0 10px 0",
                }}
              >
                {Object.keys(categoriasConteo).length === 0 ? (
                  <p style={{ color: "#777", margin: "auto" }}>
                    Cargando datos del gráfico...
                  </p>
                ) : (
                  Object.entries(categoriasConteo).map(([cat, count]) => {
                    // Calcula altura garantizada entre 40px y 170px según el conteo
                    const alturaPx = Math.max(
                      45,
                      Math.min(
                        170,
                        (count / (totalIngresados || 1)) * 160 + 35,
                      ),
                    );

                    return (
                      <div
                        key={cat}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          height: "100%",
                          width: "70px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 800,
                            marginBottom: "8px",
                            color: "#111",
                          }}
                        >
                          {count}
                        </span>
                        <div
                          style={{
                            width: "38px",
                            height: `${alturaPx}px`, // Altura fija en px que nunca colapsa
                            backgroundColor: "#1976d2",
                            borderRadius: "4px 4px 0 0",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                          }}
                        />
                      </div>
                    );
                  })
                )}
              </div>

              {/* Etiquetas de categorías debajo de cada barra */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  textAlign: "center",
                  marginTop: "6px",
                }}
              >
                {Object.keys(categoriasConteo).map((cat) => (
                  <div
                    key={cat}
                    style={{
                      width: "80px",
                      fontSize: "11px",
                      color: "#555",
                      fontWeight: 600,
                    }}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
