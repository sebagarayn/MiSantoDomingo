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
  IonCardContent,
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonText,
  IonToast,
  IonTabBar,
  IonTabButton,
  IonFooter,
} from "@ionic/react";
import {
  addCircleOutline,
  searchOutline,
  checkmarkCircle,
  locationOutline,
  calendarOutline,
  timeOutline,
  cameraOutline,
  arrowBackOutline,
  imageOutline,
  homeOutline,
  logOutOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { reportService } from "../../services/report.service";
import { IReport } from "../../types";

// Categorias del Figma movil
const CATEGORIAS_FIGMA = [
  "Alumbrado público",
  "Aseo y ornato",
  "Calles y veredas",
  "Seguridad",
  "Transporte",
  "Otros",
];

const VecinoHomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const history = useHistory();

  const [reclamos, setReclamos] = useState<IReport[]>([]);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [reclamoCreadoExito, setReclamoCreadoExito] = useState<IReport | null>(
    null,
  );
  const [toastMsg, setToastMsg] = useState("");

  // Formulario nuevo reclamo (RF-01)
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [fotoSimulada, setFotoSimulada] = useState(false);

  // Carga los reclamos del usuario conectado
  const cargarReclamos = async () => {
    const data = await reportService.obtenerReclamos();
    setReclamos(
      data.filter((r) => r.creadorId === user?.id || r.origen === "usuario"),
    );
  };

  useEffect(() => {
    cargarReclamos();
  }, []);

  // Envia el reclamo al mock
  const handleEnviarReclamo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoria || !descripcion.trim() || !ubicacion.trim()) {
      setToastMsg("Por favor complete la categoría, ubicación y descripción.");
      return;
    }

    const idUsuario = user?.id || "usr-vecino-1";

    const nuevo = await reportService.crearReclamo(
      {
        categoria,
        descripcion,
        ubicacion,
        origen: "usuario",
        creadorId: idUsuario,
        fotoUrl: fotoSimulada
          ? "https://via.placeholder.com/400x300.png?text=Foto+Reclamo"
          : undefined,
      },
      idUsuario,
    );

    setReclamos((prev) => [nuevo, ...prev]);
    setReclamoCreadoExito(nuevo);

    setCategoria("");
    setDescripcion("");
    setUbicacion("");
    setFotoSimulada(false);
  };

  const cerrarFlujoExito = () => {
    setReclamoCreadoExito(null);
    setModalCrearAbierto(false);
    cargarReclamos();
  };

  return (
    <IonPage>
      {/* Barra superior con identidad unificada */}
      <IonHeader className="ion-no-border">
        <IonToolbar
          style={{
            "--background": "#0D3B66",
            padding: "4px 0",
          }}
        >
          <IonButtons slot="start">
            {/* Se oculta en PC automaticamente */}
            <IonMenuButton
              className="ion-hide-md-up"
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
            Mis Reclamos
          </IonTitle>

          {/* Logo municipal en pastilla blanca limpia */}
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

        {/* Franja tricolor Santo Domingo */}
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
          style={{ maxWidth: "520px", margin: "0 auto", paddingBottom: "30px" }}
        >
          {/* Bienvenida al vecino */}
          <div style={{ margin: "8px 0 16px 0" }}>
            <h2
              style={{
                fontWeight: 800,
                fontSize: "1.3rem",
                color: "#0D3B66",
                margin: "0 0 2px 0",
              }}
            >
              Hola, {user?.nombre || "Vecino"}
            </h2>
            <IonText color="medium">
              <p style={{ margin: 0, fontSize: "13px" }}>
                Portal de atencion y seguimiento comunal
              </p>
            </IonText>
          </div>

          {/* Tarjeta "¿Que desea hacer?" */}
          <IonCard
            style={{
              borderRadius: "16px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
              overflow: "hidden",
              margin: "0 0 20px 0",
            }}
          >
            <IonCardContent style={{ padding: "20px" }}>
              <h3
                style={{
                  fontWeight: 800,
                  fontSize: "15px",
                  marginBottom: "14px",
                  color: "#0F172A",
                }}
              >
                ¿Que desea hacer?
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <IonButton
                  expand="block"
                  style={{
                    "--background": "#0D3B66",
                    "--border-radius": "8px",
                    height: "46px",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                  onClick={() => setModalCrearAbierto(true)}
                >
                  <IonIcon slot="start" icon={addCircleOutline} />
                  Ingresar un reclamo
                </IonButton>

                <IonButton
                  expand="block"
                  fill="outline"
                  style={{
                    "--border-color": "#0D3B66",
                    "--color": "#0D3B66",
                    "--border-radius": "8px",
                    height: "44px",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                  onClick={() => history.push("/consulta")}
                >
                  <IonIcon slot="start" icon={searchOutline} />
                  Consultar un reclamo
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Listado "Mis reclamos" */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <h3
              style={{
                fontWeight: 800,
                fontSize: "15px",
                color: "#0F172A",
                margin: 0,
              }}
            >
              Mis reclamos
            </h3>
            <span
              style={{
                background: "#0D3B66",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "10px",
              }}
            >
              {reclamos.length}
            </span>
          </div>

          {reclamos.length === 0 ? (
            <IonCard
              style={{
                borderRadius: "12px",
                textAlign: "center",
                padding: "20px",
                border: "1px solid #E2E8F0",
              }}
            >
              <IonText color="medium">
                <p style={{ margin: 0, fontSize: "13px" }}>
                  No tienes reclamos registrados actualmente.
                </p>
              </IonText>
            </IonCard>
          ) : (
            reclamos.map((r) => {
              const { diasRestantes, vencido } =
                reportService.calcularDiasRestantes(r.fechaIngreso);
              const enProceso =
                r.estado !== "Resuelto" && r.estado !== "Rechazado";

              return (
                <IonCard
                  key={r.folio}
                  style={{
                    borderRadius: "14px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    marginBottom: "12px",
                  }}
                >
                  <IonCardContent style={{ padding: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "1.1rem",
                          color: "#0D3B66",
                          fontWeight: 800,
                        }}
                      >
                        #{r.folio}
                      </strong>

                      {/* Badge con color semantico */}
                      <span
                        style={{
                          background: enProceso ? "#FEF3C7" : "#DCFCE7",
                          color: enProceso ? "#B45309" : "#15803D",
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          textTransform: "uppercase",
                        }}
                      >
                        {enProceso ? "EN PROCESO" : r.estado}
                      </span>
                    </div>

                    <h4
                      style={{
                        margin: "8px 0 4px 0",
                        fontWeight: 700,
                        color: "#1E293B",
                        fontSize: "14px",
                      }}
                    >
                      {r.categoria}
                    </h4>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#64748B",
                        fontSize: "12px",
                      }}
                    >
                      <IonIcon icon={locationOutline} />
                      <span>{r.ubicacion}</span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "10px",
                        paddingTop: "10px",
                        borderTop: "1px solid #F1F5F9",
                        fontSize: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          color: "#64748B",
                        }}
                      >
                        <IonIcon icon={calendarOutline} />
                        <span>
                          {new Date(r.fechaIngreso).toLocaleDateString()}
                        </span>
                      </div>

                      {enProceso ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: vencido ? "#DC2626" : "#D97706",
                            fontWeight: 700,
                          }}
                        >
                          <IonIcon icon={timeOutline} />
                          <span>{diasRestantes} dias restantes</span>
                        </div>
                      ) : (
                        <span style={{ color: "#15803D", fontWeight: 700 }}>
                          Resuelto
                        </span>
                      )}
                    </div>
                  </IonCardContent>
                </IonCard>
              );
            })
          )}
        </div>

        {/* Modal: Ingresar un reclamo (RF-01) */}
        <IonModal
          isOpen={modalCrearAbierto}
          onDidDismiss={() => setModalCrearAbierto(false)}
        >
          <IonHeader className="ion-no-border">
            <IonToolbar style={{ "--background": "#0D3B66" }}>
              <IonButtons slot="start">
                <IonButton
                  onClick={() => setModalCrearAbierto(false)}
                  style={{ color: "#FFFFFF" }}
                >
                  <IonIcon icon={arrowBackOutline} />
                </IonButton>
              </IonButtons>
              <IonTitle
                style={{
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "14px",
                  textTransform: "uppercase",
                }}
              >
                Ingresar un reclamo
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

          <IonContent
            className="ion-padding"
            style={{ "--background": "#F8FAFC" }}
          >
            <div style={{ maxWidth: "520px", margin: "0 auto" }}>
              {!reclamoCreadoExito ? (
                <form onSubmit={handleEnviarReclamo}>
                  {/* Selector de categoria */}
                  <div style={{ marginBottom: "14px" }}>
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#334155",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Seleccionar Categoria (*)
                    </label>
                    <IonItem
                      lines="none"
                      style={{
                        border: "1px solid #CBD5E1",
                        borderRadius: "8px",
                        background: "#FFFFFF",
                      }}
                    >
                      <IonSelect
                        value={categoria}
                        placeholder="Seleccionar Categoria..."
                        onIonChange={(e) => setCategoria(e.detail.value)}
                        interface="action-sheet"
                      >
                        {CATEGORIAS_FIGMA.map((cat) => (
                          <IonSelectOption key={cat} value={cat}>
                            {cat}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                  </div>

                  {/* Descripcion con contador de caracteres */}
                  <div style={{ marginBottom: "14px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#334155",
                        }}
                      >
                        Descripcion (*)
                      </label>
                      <small
                        style={{
                          color:
                            descripcion.length >= 500 ? "#DC2626" : "#64748B",
                        }}
                      >
                        {descripcion.length}/500 caracteres
                      </small>
                    </div>
                    <IonItem
                      lines="none"
                      style={{
                        border: "1px solid #CBD5E1",
                        borderRadius: "8px",
                        background: "#FFFFFF",
                      }}
                    >
                      <IonTextarea
                        value={descripcion}
                        rows={5}
                        maxlength={500}
                        placeholder="Cuentanos que ocurrio..."
                        onIonInput={(e) => setDescripcion(e.detail.value!)}
                      />
                    </IonItem>
                  </div>

                  {/* Direccion */}
                  <div style={{ marginBottom: "14px" }}>
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#334155",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Ingresa la direccion (*)
                    </label>
                    <IonItem
                      lines="none"
                      style={{
                        border: "1px solid #CBD5E1",
                        borderRadius: "8px",
                        background: "#FFFFFF",
                      }}
                    >
                      <IonInput
                        value={ubicacion}
                        placeholder="Ej: Av. Arturo Phillips 245, Santo Domingo"
                        onIonInput={(e) => setUbicacion(e.detail.value!)}
                      />
                    </IonItem>
                  </div>

                  {/* Adjuntar fotografia */}
                  <div style={{ marginBottom: "22px" }}>
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#334155",
                        display: "block",
                        marginBottom: "2px",
                      }}
                    >
                      ADJUNTAR FOTOGRAFIA
                    </label>
                    <small
                      style={{
                        color: "#64748B",
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "11px",
                      }}
                    >
                      JPG o PNG - Max. 5MB (Opcional)
                    </small>

                    <IonButton
                      expand="block"
                      fill="outline"
                      style={{
                        "--border-color": "#CBD5E1",
                        "--color": "#0D3B66",
                        "--border-radius": "8px",
                        fontSize: "13px",
                      }}
                      onClick={() => setFotoSimulada(!fotoSimulada)}
                    >
                      <IonIcon
                        slot="start"
                        icon={fotoSimulada ? imageOutline : cameraOutline}
                      />
                      {fotoSimulada
                        ? "Fotografia adjuntada (1 archivo)"
                        : "Adjuntar fotografia"}
                    </IonButton>
                  </div>

                  {/* Boton enviar con azul municipal */}
                  <IonButton
                    expand="block"
                    type="submit"
                    style={{
                      "--background": "#0D3B66",
                      "--border-radius": "8px",
                      height: "46px",
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    Enviar reclamo
                  </IonButton>
                </form>
              ) : (
                /* Pantalla de confirmacion con folio unico (RF-02) */
                <div
                  className="ion-text-center"
                  style={{ padding: "20px 10px" }}
                >
                  <IonIcon
                    icon={checkmarkCircle}
                    style={{ fontSize: "72px", color: "#2E7D32" }}
                  />

                  <h2
                    style={{
                      fontWeight: 800,
                      margin: "14px 0 6px 0",
                      color: "#0D3B66",
                    }}
                  >
                    ¡Reclamo ingresado correctamente!
                  </h2>

                  <IonCard
                    style={{
                      borderRadius: "16px",
                      margin: "20px 0",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                      background: "#FFFFFF",
                    }}
                  >
                    <IonCardContent style={{ padding: "20px" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#64748B",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: 600,
                        }}
                      >
                        Numero de folio
                      </span>
                      <h1
                        style={{
                          fontWeight: 800,
                          fontSize: "2rem",
                          margin: "6px 0",
                          color: "#0D3B66",
                        }}
                      >
                        #{reclamoCreadoExito.folio}
                      </h1>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#64748B",
                          margin: "6px 0 14px 0",
                        }}
                      >
                        Guarda este numero para realizar el seguimiento de tu
                        reclamo.
                      </p>
                      <div
                        style={{
                          borderTop: "1px solid #F1F5F9",
                          paddingTop: "10px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        <strong>Fecha de ingreso:</strong>{" "}
                        {new Date(
                          reclamoCreadoExito.fechaIngreso,
                        ).toLocaleDateString()}
                      </div>
                    </IonCardContent>
                  </IonCard>

                  <IonButton
                    expand="block"
                    style={{
                      "--background": "#0D3B66",
                      "--border-radius": "8px",
                      height: "46px",
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                    onClick={cerrarFlujoExito}
                  >
                    Volver al inicio
                  </IonButton>
                </div>
              )}
            </div>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={2500}
          onDidDismiss={() => setToastMsg("")}
        />
      </IonContent>

      {/* Barra inferior nativa con estilo unificado */}
      {/* CAMBIO 1: Agregamos ion-hide-md-up para que en PC desaparezca */}
      <IonFooter className="ion-hide-md-up">
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
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{ "--color-selected": "#0D3B66" }}
          >
            <IonIcon icon={homeOutline} style={{ color: "#0D3B66" }} />
            <IonLabel style={{ color: "#0D3B66", fontWeight: 700 }}>
              Inicio
            </IonLabel>
          </IonTabButton>

          <IonTabButton
            tab="reclamos"
            onClick={() => setModalCrearAbierto(true)}
          >
            <IonIcon icon={addCircleOutline} />
            <IonLabel>Ingresar</IonLabel>
          </IonTabButton>

          <IonTabButton
            tab="consulta"
            onClick={() => history.push("/consulta")}
          >
            <IonIcon icon={searchOutline} />
            <IonLabel>Consultar</IonLabel>
          </IonTabButton>

          <IonTabButton tab="salir" onClick={logout}>
            <IonIcon icon={logOutOutline} />
            <IonLabel>Salir</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonFooter>
    </IonPage>
  );
};

export default VecinoHomePage;
