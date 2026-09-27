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
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonToast,
  IonFooter,
  IonTabBar,
  IonTabButton,
  IonAlert,
  IonText,
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
  homeOutline,
  addCircleOutline,
  logOutOutline,
  logInOutline,
  clipboardOutline,
  statsChartOutline,
} from "ionicons/icons";
import { reportService } from "../../services/report.service";
import { IReport } from "../../types";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ConsultaPublicaPage: React.FC = () => {
  const history = useHistory();
  const { isAuthenticated, user, logout } = useAuth();

  // Estados locales para el buscador, el reclamo encontrado y las alertas
  const [folioInput, setFolioInput] = useState("");
  const [report, setReport] = useState<IReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [calificacionTemp, setCalificacionTemp] = useState<number>(0);
  const [alertaSalirAbierta, setAlertaSalirAbierta] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Aca calculamos a donde debe volver la flecha en PC: si esta logueado vuelve a su panel, si no al login
  const rutaRegreso = isAuthenticated
    ? user?.rol === "admin"
      ? "/admin/inicio"
      : "/app/inicio"
    : "/login";

  // Esta funcion busca el reclamo en el mock y si ya venia con calificacion previa deja las estrellas listas
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!folioInput.trim()) return;

    setLoading(true);
    setSearched(true);
    const resultado = await reportService.obtenerReclamoPorFolio(folioInput);
    setReport(resultado);

    if (resultado && resultado.calificacion) {
      setCalificacionTemp(resultado.calificacion);
    } else {
      setCalificacionTemp(0);
    }
    setLoading(false);
  };

  // Envia la calificacion de 1 a 5 estrellas al mock y actualiza la tarjeta al tiro para bloquear los botones (RF-09)
  const handleCalificar = async (puntuacion: number) => {
    if (!report) return;
    setCalificacionTemp(puntuacion);
    await reportService.calificarRespuesta(report.folio, {
      calificacion: puntuacion,
    });
    setToastMsg(`Calificación registrada: ${puntuacion} de 5 estrellas.`);

    // Refrescamos el reclamo para que la interfaz sepa que ya tiene calificacion guardada
    const actualizado = await reportService.obtenerReclamoPorFolio(
      report.folio,
    );
    setReport(actualizado);
  };

  // Asigna los colores limpios de la paleta segun el estado del reclamo
  const getBadgeStyle = (estado: string) => {
    switch (estado) {
      case "Resuelto":
        return { background: "#DCFCE7", color: "#15803D" };
      case "Derivado":
        return { background: "#E0F2FE", color: "#0369A1" };
      case "En Revisión":
        return { background: "#F1F5F9", color: "#334155" };
      case "Pendiente":
      default:
        return { background: "#FEF3C7", color: "#B45309" };
    }
  };

  return (
    <IonPage>
      {/* Metemos estas reglas CSS directas con media queries para asegurarnos de que la barra inferior solo se vea en celular y la flecha volver solo en PC */}
      <style>{`
        @media (max-width: 767px) {
          .solo-desktop { display: none !important; }
          .solo-movil { display: block !important; }
        }
        @media (min-width: 768px) {
          .solo-desktop { display: flex !important; }
          .solo-movil { display: none !important; }
        }
      `}</style>

      {/* Barra superior con color azul municipal #0D3B66 */}
      <IonHeader className="ion-no-border">
        <IonToolbar
          style={{
            "--background": "#0D3B66",
            padding: "4px 0",
          }}
        >
          {/* En celular la flecha no se muestra porque abajo tenemos la barra de navegacion fija */}
          <IonButtons slot="start" className="solo-desktop">
            <IonBackButton
              defaultHref={rutaRegreso}
              text="Volver"
              style={{ color: "#FFFFFF" }}
            />
          </IonButtons>

          <IonTitle
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            Consulta Ciudadana
          </IonTitle>

          {/* Logo oficial dentro de una pastilla blanca limpia a la derecha */}
          <IonButtons slot="end" style={{ paddingRight: "12px" }}>
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "8px",
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              <img
                src="/logo-santodomingo.png"
                alt="Logo Santo Domingo"
                style={{
                  maxHeight: "30px",
                  maxWidth: "100px",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          </IonButtons>
        </IonToolbar>

        {/* Franja tricolor */}
        <div
          style={{
            height: "4px",
            width: "100%",
            background:
              "linear-gradient(90deg, #0D3B66 0%, #2E7D32 50%, #F59E0B 100%)",
          }}
        />
      </IonHeader>

      <IonContent className="ion-padding" style={{ "--background": "#F8FAFC" }}>
        <div
          style={{ maxWidth: "640px", margin: "0 auto", paddingBottom: "50px" }}
        >
          {/* Tarjeta con el buscador de folio */}
          <IonCard
            style={{
              borderRadius: "16px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
              overflow: "hidden",
              margin: "8px 0 20px 0",
            }}
          >
            <IonCardContent style={{ padding: "22px 20px" }}>
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "#0D3B66",
                    margin: "0 0 4px 0",
                  }}
                >
                  Seguimiento de Reclamo
                </h2>
                <p style={{ fontSize: "13px", color: "#64748B", margin: "0" }}>
                  Ingresa tu número de folio alfanumérico (ej: SD-2026-000101)
                </p>
              </div>

              <form onSubmit={handleSearch}>
                <div
                  style={{
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    overflow: "hidden",
                    background: "#FFFFFF",
                  }}
                >
                  <IonSearchbar
                    value={folioInput}
                    onIonInput={(e) => setFolioInput(e.detail.value!)}
                    placeholder="SD-2026-XXXXXX"
                    showClearButton="focus"
                    style={{ "--background": "#FFFFFF", padding: "0" }}
                  />
                </div>

                <IonButton
                  expand="block"
                  type="submit"
                  disabled={loading || !folioInput.trim()}
                  style={{
                    "--background": "#0D3B66",
                    "--border-radius": "8px",
                    height: "46px",
                    fontWeight: 600,
                    fontSize: "14px",
                    marginTop: "12px",
                  }}
                >
                  {loading ? (
                    <IonSpinner name="crescent" color="light" />
                  ) : (
                    <>
                      <IonIcon slot="start" icon={searchOutline} />
                      Consultar Reclamo
                    </>
                  )}
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>

          {/* Tarjeta de error si el folio no existe en el mock */}
          {searched && !loading && !report && (
            <IonCard
              style={{
                borderRadius: "14px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                textAlign: "center",
                padding: "24px 16px",
              }}
            >
              <IonIcon
                icon={alertCircleOutline}
                style={{
                  fontSize: "48px",
                  color: "#F59E0B",
                  marginBottom: "8px",
                }}
              />
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#0F172A",
                  margin: "0 0 6px 0",
                }}
              >
                Folio No Encontrado
              </h3>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "0" }}>
                Verifica que el código esté bien escrito e inténtalo nuevamente.
              </p>
            </IonCard>
          )}

          {/* Ficha completa del reclamo si fue encontrado */}
          {report && (
            <IonCard
              style={{
                borderRadius: "16px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 18px rgba(0, 0, 0, 0.04)",
                overflow: "hidden",
                margin: "0",
              }}
            >
              <IonCardHeader style={{ padding: "20px 20px 10px 20px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <IonCardTitle
                    style={{
                      fontSize: "1.35rem",
                      fontWeight: 800,
                      color: "#0D3B66",
                    }}
                  >
                    #{report.folio}
                  </IonCardTitle>

                  <span
                    style={{
                      ...getBadgeStyle(report.estado),
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {report.estado}
                  </span>
                </div>

                <IonCardSubtitle
                  style={{
                    marginTop: "6px",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  {report.categoria}
                </IonCardSubtitle>
              </IonCardHeader>

              <IonCardContent style={{ padding: "10px 20px 20px 20px" }}>
                {/* Datos generales de ubicacion y fecha */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    margin: "10px 0 16px 0",
                    fontSize: "13px",
                    color: "#475569",
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

                {/* Descripcion ingresada por el vecino */}
                <div
                  style={{
                    background: "#F8FAFC",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    marginBottom: "16px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748B",
                      textTransform: "uppercase",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Descripción del vecino
                  </span>
                  <p
                    style={{ margin: "0", fontSize: "14px", color: "#1E293B" }}
                  >
                    {report.descripcion}
                  </p>
                </div>

                {/* Plazo legal de 20 dias corridos segun el RF-04 */}
                {report.estado !== "Resuelto" && (
                  <div
                    style={{
                      background: reportService.calcularDiasRestantes(
                        report.fechaIngreso,
                      ).vencido
                        ? "#FEF2F2"
                        : "#F0F9FF",
                      borderLeft: `4px solid ${
                        reportService.calcularDiasRestantes(report.fechaIngreso)
                          .vencido
                          ? "#EF4444"
                          : "#0284C7"
                      }`,
                      padding: "12px",
                      borderRadius: "0 8px 8px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "16px",
                    }}
                  >
                    <IonIcon
                      icon={timeOutline}
                      style={{
                        fontSize: "22px",
                        color: reportService.calcularDiasRestantes(
                          report.fechaIngreso,
                        ).vencido
                          ? "#EF4444"
                          : "#0284C7",
                      }}
                    />
                    <div>
                      <strong style={{ fontSize: "13px", color: "#0F172A" }}>
                        Plazo de respuesta legal:
                      </strong>
                      <p
                        style={{
                          margin: "2px 0 0 0",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {
                          reportService.calcularDiasRestantes(
                            report.fechaIngreso,
                          ).diasRestantes
                        }{" "}
                        días restantes (de 20 días corridos)
                        {reportService.calcularDiasRestantes(
                          report.fechaIngreso,
                        ).vencido && " — Plazo legal vencido"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Respuesta oficial de la municipalidad si ya fue resuelto */}
                {report.respuestaFormal && (
                  <div
                    style={{
                      background: "#F0FDF4",
                      borderLeft: "4px solid #2E7D32",
                      padding: "12px",
                      borderRadius: "0 8px 8px 0",
                      marginBottom: "16px",
                    }}
                  >
                    <strong style={{ color: "#15803D", fontSize: "13px" }}>
                      Respuesta Oficial Municipal:
                    </strong>
                    <p
                      style={{
                        margin: "6px 0 0 0",
                        color: "#166534",
                        fontSize: "14px",
                      }}
                    >
                      {report.respuestaFormal}
                    </p>
                  </div>
                )}

                {/* Esta seccion de estrellas solo se activa si el reclamo ya fue resuelto (RF-09: una sola vez) */}
                {report.estado === "Resuelto" && (
                  <div
                    style={{
                      textAlign: "center",
                      borderTop: "1px solid #F1F5F9",
                      paddingTop: "16px",
                      marginTop: "16px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#0D3B66",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Califica nuestra respuesta
                    </h4>
                    <p
                      style={{
                        fontSize: "12px",
                        color: report.calificacion ? "#15803D" : "#64748B",
                        fontWeight: report.calificacion ? 700 : 400,
                        margin: "0 0 8px 0",
                      }}
                    >
                      {report.calificacion
                        ? `Calificación registrada: ${report.calificacion} de 5 estrellas (completado)`
                        : "¿Cómo evalúa la solución entregada por el municipio?"}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "6px",
                        margin: "6px 0",
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((estrella) => (
                        <IonButton
                          key={estrella}
                          fill="clear"
                          size="large"
                          disabled={Boolean(report.calificacion)}
                          onClick={() => handleCalificar(estrella)}
                        >
                          <IonIcon
                            slot="icon-only"
                            icon={
                              (report.calificacion || calificacionTemp) >=
                              estrella
                                ? star
                                : starOutline
                            }
                            style={{
                              color:
                                (report.calificacion || calificacionTemp) >=
                                estrella
                                  ? "#F59E0B"
                                  : "#CBD5E1",
                              fontSize: "28px",
                            }}
                          />
                        </IonButton>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linea de tiempo con el historial de avances para la trazabilidad (RNF-05) */}
                <div
                  style={{
                    borderTop: "1px solid #F1F5F9",
                    paddingTop: "16px",
                    marginTop: "16px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0F172A",
                      margin: "0 0 8px 0",
                    }}
                  >
                    Historial de avances
                  </h4>
                  <IonList lines="none">
                    {report.historial.map((item, idx) => (
                      <IonItem
                        key={idx}
                        className="ion-no-padding"
                        style={{
                          "--background": "transparent",
                          marginBottom: "8px",
                        }}
                      >
                        <IonIcon
                          icon={checkmarkCircleOutline}
                          slot="start"
                          color="primary"
                          style={{ fontSize: "20px" }}
                        />
                        <IonLabel>
                          <h3
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#1E293B",
                            }}
                          >
                            {item.estado}
                          </h3>
                          <p style={{ fontSize: "13px", color: "#475569" }}>
                            {item.observacion}
                          </p>
                          <IonText color="medium">
                            <small>
                              {new Date(item.fecha).toLocaleString()}
                            </small>
                          </IonText>
                        </IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                </div>
              </IonCardContent>
            </IonCard>
          )}
        </div>

        {/* Modal de confirmacion antes de salir para no perder la sesion por un toque accidental */}
        <IonAlert
          isOpen={alertaSalirAbierta}
          onDidDismiss={() => setAlertaSalirAbierta(false)}
          header="¿Cerrar sesión?"
          message="¿Está seguro de que desea salir del sistema?"
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

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={2500}
          onDidDismiss={() => setToastMsg("")}
        />
      </IonContent>

      {/* Barra inferior fija solo para celulares (en PC se oculta) */}
      <IonFooter className="solo-movil">
        {isAuthenticated && user?.rol === "vecino" ? (
          <IonTabBar
            slot="bottom"
            style={{
              borderTop: "1px solid #E2E8F0",
              height: "60px",
              "--background": "#FFFFFF",
            }}
          >
            <IonTabButton
              tab="inicio"
              onClick={() => history.push("/app/inicio")}
            >
              <IonIcon icon={homeOutline} style={{ color: "#64748B" }} />
              <IonLabel style={{ color: "#64748B", fontWeight: 500 }}>
                Mis Reclamos
              </IonLabel>
            </IonTabButton>

            <IonTabButton
              tab="nuevo"
              onClick={() => history.push("/app/inicio?tab=nuevo")}
            >
              <IonIcon icon={addCircleOutline} style={{ color: "#64748B" }} />
              <IonLabel style={{ color: "#64748B", fontWeight: 500 }}>
                Nuevo
              </IonLabel>
            </IonTabButton>

            <IonTabButton
              tab="consulta"
              style={{ "--color-selected": "#0D3B66" }}
            >
              <IonIcon icon={searchOutline} style={{ color: "#0D3B66" }} />
              <IonLabel style={{ color: "#0D3B66", fontWeight: 800 }}>
                Consultar
              </IonLabel>
            </IonTabButton>

            <IonTabButton
              tab="salir"
              onClick={() => setAlertaSalirAbierta(true)}
            >
              <IonIcon icon={logOutOutline} style={{ color: "#64748B" }} />
              <IonLabel style={{ color: "#64748B", fontWeight: 500 }}>
                Salir
              </IonLabel>
            </IonTabButton>
          </IonTabBar>
        ) : isAuthenticated && user?.rol === "admin" ? (
          <IonTabBar
            slot="bottom"
            style={{
              borderTop: "1px solid #E2E8F0",
              height: "60px",
              "--background": "#FFFFFF",
            }}
          >
            <IonTabButton
              tab="admin_reclamos"
              onClick={() => history.push("/admin/inicio")}
            >
              <IonIcon icon={clipboardOutline} style={{ color: "#64748B" }} />
              <IonLabel style={{ color: "#64748B", fontWeight: 500 }}>
                Reclamos
              </IonLabel>
            </IonTabButton>

            <IonTabButton
              tab="admin_kpis"
              onClick={() => history.push("/admin/dashboard")}
            >
              <IonIcon icon={statsChartOutline} style={{ color: "#64748B" }} />
              <IonLabel style={{ color: "#64748B", fontWeight: 500 }}>
                Métricas
              </IonLabel>
            </IonTabButton>

            <IonTabButton
              tab="consulta"
              style={{ "--color-selected": "#0D3B66" }}
            >
              <IonIcon icon={searchOutline} style={{ color: "#0D3B66" }} />
              <IonLabel style={{ color: "#0D3B66", fontWeight: 800 }}>
                Consultar
              </IonLabel>
            </IonTabButton>

            <IonTabButton
              tab="salir"
              onClick={() => setAlertaSalirAbierta(true)}
            >
              <IonIcon icon={logOutOutline} style={{ color: "#64748B" }} />
              <IonLabel style={{ color: "#64748B", fontWeight: 500 }}>
                Salir
              </IonLabel>
            </IonTabButton>
          </IonTabBar>
        ) : (
          <IonTabBar
            slot="bottom"
            style={{
              borderTop: "1px solid #E2E8F0",
              height: "60px",
              "--background": "#FFFFFF",
            }}
          >
            <IonTabButton tab="login" onClick={() => history.push("/login")}>
              <IonIcon icon={logInOutline} style={{ color: "#64748B" }} />
              <IonLabel style={{ color: "#64748B", fontWeight: 500 }}>
                Iniciar Sesión
              </IonLabel>
            </IonTabButton>

            <IonTabButton
              tab="consulta"
              style={{ "--color-selected": "#0D3B66" }}
            >
              <IonIcon icon={searchOutline} style={{ color: "#0D3B66" }} />
              <IonLabel style={{ color: "#0D3B66", fontWeight: 800 }}>
                Consultar
              </IonLabel>
            </IonTabButton>
          </IonTabBar>
        )}
      </IonFooter>
    </IonPage>
  );
};

export default ConsultaPublicaPage;
