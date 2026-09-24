import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
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
  IonFooter,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonAlert,
} from "@ionic/react";
import {
  timeOutline,
  alertCircleOutline,
  documentTextOutline,
  calendarOutline,
  clipboardOutline,
  statsChartOutline,
  logOutOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { reportService } from "../../services/report.service";
import { IReport } from "../../types";
import AdminSidebar from "../../components/AdminSidebar";

const Dashboard: React.FC = () => {
  const history = useHistory();
  const { logout } = useAuth();

  const [reclamos, setReclamos] = useState<IReport[]>([]);
  const [periodo, setPeriodo] = useState("30dias");
  const [alertaSalirAbierta, setAlertaSalirAbierta] = useState(false);

  useEffect(() => {
    reportService.obtenerReclamos().then(setReclamos);
  }, []);

  const totalIngresados = reclamos.length;
  const resueltos = reclamos.filter((r) => r.estado === "Resuelto").length;

  const vencidos = reclamos.filter(
    (r) =>
      r.estado !== "Resuelto" &&
      reportService.calcularDiasRestantes(r.fechaIngreso).vencido,
  ).length;

  const tasaResolucion =
    totalIngresados > 0 ? Math.round((resueltos / totalIngresados) * 100) : 0;

  const categoriasConteo: { [key: string]: number } = {};
  reclamos.forEach((r) => {
    const cat = r.categoria || "Otros";
    categoriasConteo[cat] = (categoriasConteo[cat] || 0) + 1;
  });

  return (
    <IonPage>
      {/* Cabecera para celular */}
      <IonHeader className="ion-no-border ion-hide-md-up">
        <IonToolbar style={{ "--background": "#0D3B66", padding: "4px 0" }}>
          <IonTitle
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "#FFFFFF",
              textTransform: "uppercase",
            }}
          >
            Dashboard OIRS
          </IonTitle>
          <IonButtons slot="end" style={{ paddingRight: "12px" }}>
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "8px",
                padding: "4px 8px",
              }}
            >
              <img
                src="/logo-santodomingo.png"
                alt="Logo"
                style={{ maxHeight: "26px" }}
              />
            </div>
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
        <div style={{ display: "flex", minHeight: "100%" }}>
          <AdminSidebar />

          <main
            style={{
              flex: 1,
              padding: "24px 28px",
              maxWidth: "1200px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Cabecera y selector de periodo */}
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
                <h1
                  style={{
                    fontWeight: 800,
                    color: "#0D3B66",
                    margin: "0 0 2px 0",
                    fontSize: "1.5rem",
                  }}
                >
                  Métricas de Gestión OIRS
                </h1>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748B" }}>
                  Monitoreo de cumplimiento de plazos y volumen comunal (RF-10)
                </p>
              </div>

              {/* Filtro de rango temporal */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: "8px",
                  padding: "2px 8px",
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
                  style={{
                    fontSize: "13px",
                    color: "#0D3B66",
                    fontWeight: 600,
                  }}
                >
                  <IonSelectOption value="7dias">
                    Ultimos 7 dias
                  </IonSelectOption>
                  <IonSelectOption value="30dias">
                    Ultimos 30 dias
                  </IonSelectOption>
                  <IonSelectOption value="anio">
                    Año en curso (2026)
                  </IonSelectOption>
                </IonSelect>
              </div>
            </div>

            {/* Tarjetas KPI superiores */}
            <IonGrid
              className="ion-no-padding"
              style={{ marginBottom: "20px" }}
            >
              <IonRow>
                {/* KPI 1 */}
                <IonCol size="12" sizeMd="4">
                  <IonCard
                    style={{
                      borderRadius: "14px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      margin: "6px",
                    }}
                  >
                    <IonCardHeader style={{ padding: "16px 16px 8px 16px" }}>
                      <IonCardSubtitle
                        style={{
                          color: "#64748B",
                          fontWeight: 700,
                          fontSize: "12px",
                          textTransform: "uppercase",
                        }}
                      >
                        Reclamos Ingresados
                      </IonCardSubtitle>
                      <IonCardTitle
                        style={{
                          fontSize: "2.4rem",
                          fontWeight: 800,
                          color: "#0D3B66",
                          margin: "4px 0 0 0",
                        }}
                      >
                        {totalIngresados}
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent style={{ padding: "0 16px 16px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "#475569",
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

                {/* KPI 2 */}
                <IonCol size="12" sizeMd="4">
                  <IonCard
                    style={{
                      borderRadius: "14px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      margin: "6px",
                    }}
                  >
                    <IonCardHeader style={{ padding: "16px 16px 8px 16px" }}>
                      <IonCardSubtitle
                        style={{
                          color: "#64748B",
                          fontWeight: 700,
                          fontSize: "12px",
                          textTransform: "uppercase",
                        }}
                      >
                        Tiempo Promedio de Respuesta
                      </IonCardSubtitle>
                      <IonCardTitle
                        style={{
                          fontSize: "2.4rem",
                          fontWeight: 800,
                          color: "#0D3B66",
                          margin: "4px 0 0 0",
                        }}
                      >
                        7 dias
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent style={{ padding: "0 16px 16px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "#15803D",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        <IonIcon icon={timeOutline} />
                        <span>Cumple estandar legal de 20 dias</span>
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>

                {/* KPI 3 */}
                <IonCol size="12" sizeMd="4">
                  <IonCard
                    style={{
                      borderRadius: "14px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      margin: "6px",
                    }}
                  >
                    <IonCardHeader style={{ padding: "16px 16px 8px 16px" }}>
                      <IonCardSubtitle
                        style={{
                          color: "#64748B",
                          fontWeight: 700,
                          fontSize: "12px",
                          textTransform: "uppercase",
                        }}
                      >
                        Reclamos Vencidos
                      </IonCardSubtitle>
                      <IonCardTitle
                        style={{
                          fontSize: "2.4rem",
                          fontWeight: 800,
                          color: vencidos > 0 ? "#DC2626" : "#0D3B66",
                          margin: "4px 0 0 0",
                        }}
                      >
                        {vencidos}
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent style={{ padding: "0 16px 16px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: vencidos > 0 ? "#DC2626" : "#64748B",
                          fontSize: "13px",
                          fontWeight: vencidos > 0 ? 700 : 400,
                        }}
                      >
                        <IonIcon icon={alertCircleOutline} />
                        <span>
                          {vencidos > 0
                            ? "Requieren atencion urgente"
                            : "Sin alertas de plazo"}
                        </span>
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>

            {/* Grafico de barras */}
            <IonCard
              style={{
                borderRadius: "16px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                padding: "20px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                margin: "6px",
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
                  <IonCardTitle
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 800,
                      color: "#0D3B66",
                    }}
                  >
                    Volumen de Solicitudes por Categoria
                  </IonCardTitle>
                  <span
                    style={{
                      background: "#F1F5F9",
                      color: "#0D3B66",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    {periodo === "30dias" ? "Ultimos 30 dias" : periodo}
                  </span>
                </div>
              </IonCardHeader>

              <IonCardContent className="ion-no-padding">
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-around",
                    height: "240px",
                    borderBottom: "2px solid #E2E8F0",
                    paddingBottom: "0",
                    margin: "20px 0 10px 0",
                  }}
                >
                  {Object.keys(categoriasConteo).length === 0 ? (
                    <p style={{ color: "#64748B", margin: "auto" }}>
                      Cargando datos del grafico...
                    </p>
                  ) : (
                    Object.entries(categoriasConteo).map(([cat, count]) => {
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
                              color: "#0D3B66",
                            }}
                          >
                            {count}
                          </span>
                          <div
                            style={{
                              width: "38px",
                              height: `${alturaPx}px`,
                              backgroundColor: "#0D3B66",
                              borderRadius: "4px 4px 0 0",
                              boxShadow: "0 2px 4px rgba(13, 59, 102, 0.2)",
                            }}
                          />
                        </div>
                      );
                    })
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    textAlign: "center",
                    marginTop: "8px",
                  }}
                >
                  {Object.keys(categoriasConteo).map((cat) => (
                    <div
                      key={cat}
                      style={{
                        width: "80px",
                        fontSize: "11px",
                        color: "#64748B",
                        fontWeight: 600,
                      }}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              </IonCardContent>
            </IonCard>
          </main>
        </div>

        {/* Alerta de salida */}
        <IonAlert
          isOpen={alertaSalirAbierta}
          onDidDismiss={() => setAlertaSalirAbierta(false)}
          header="¿Cerrar sesión?"
          message="¿Está seguro de que desea salir del portal funcionario?"
          buttons={[
            { text: "Cancelar", role: "cancel" },
            {
              text: "Cerrar sesión",
              role: "destructive",
              handler: () => {
                logout();
                history.push("/login");
              },
            },
          ]}
        />
      </IonContent>

      {/* Barra inferior solo para los celulares (Admin movil) */}
      <IonFooter className="ion-hide-md-up">
        <IonTabBar
          slot="bottom"
          style={{
            borderTop: "1px solid #E2E8F0",
            height: "60px",
            "--background": "#FFFFFF",
          }}
        >
          {/* Pestana 1: Reclamos */}
          <IonTabButton
            tab="reclamos"
            onClick={() => history.push("/admin/inicio")}
          >
            <IonIcon icon={clipboardOutline} style={{ color: "#64748B" }} />
            <IonLabel style={{ color: "#64748B", fontWeight: 500 }}>
              Reclamos
            </IonLabel>
          </IonTabButton>

          {/* Pestana 2: Metricas (ACTIVA) */}
          <IonTabButton
            tab="metricas"
            style={{ "--color-selected": "#0D3B66" }}
          >
            <IonIcon icon={statsChartOutline} style={{ color: "#0D3B66" }} />
            <IonLabel style={{ color: "#0D3B66", fontWeight: 800 }}>
              Métricas
            </IonLabel>
          </IonTabButton>

          {/* Pestana 3: Salir */}
          <IonTabButton tab="salir" onClick={() => setAlertaSalirAbierta(true)}>
            <IonIcon icon={logOutOutline} style={{ color: "#64748B" }} />
            <IonLabel style={{ color: "#64748B", fontWeight: 500 }}>
              Salir
            </IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonFooter>
    </IonPage>
  );
};

export default Dashboard;
