import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
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
  IonList,
  IonAlert,
  IonSearchbar,
  IonSpinner,
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
  star,
  starOutline,
  businessOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
} from "ionicons/icons";
import { useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { reportService } from "../../services/report.service";
import { IReport } from "../../types";
import VecinoSidebar from "../../components/VecinoSidebar";

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
  const location = useLocation();

  const [vistaActiva, setVistaActiva] = useState<
    "mis_reclamos" | "nuevo" | "consulta"
  >("mis_reclamos");

  const [reclamos, setReclamos] = useState<IReport[]>([]);
  const [reclamoCreadoExito, setReclamoCreadoExito] = useState<IReport | null>(
    null,
  );

  // Detalle del reclamo seleccionado
  const [reclamoDetalle, setReclamoDetalle] = useState<IReport | null>(null);
  const [calificacionTemp, setCalificacionTemp] = useState<number>(0);

  // Consulta por folio integrada
  const [folioConsulta, setFolioConsulta] = useState("");
  const [reporteConsulta, setReporteConsulta] = useState<IReport | null>(null);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [cargandoConsulta, setCargandoConsulta] = useState(false);

  // Alertas
  const [alertaSalirAbierta, setAlertaSalirAbierta] = useState(false);
  const [alertaDescarteAbierta, setAlertaDescarteAbierta] = useState(false);
  const [destinoPendiente, setDestinoPendiente] = useState<
    "mis_reclamos" | "nuevo" | "consulta" | "salir" | null
  >(null);

  const [toastMsg, setToastMsg] = useState("");

  // Formulario nuevo reclamo (RF-01)
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [fotoSimulada, setFotoSimulada] = useState(false);

  const formularioTieneDatos = Boolean(
    categoria || descripcion.trim() || ubicacion.trim() || fotoSimulada,
  );

  const cargarReclamos = async () => {
    const data = await reportService.obtenerReclamos();
    setReclamos(
      data.filter((r) => r.creadorId === user?.id || r.origen === "usuario"),
    );
  };

  useEffect(() => {
    cargarReclamos();
  }, []);

  // Lee el parametro ?tab=nuevo si viene desde otra pantalla
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("tab") === "nuevo") {
      setVistaActiva("nuevo");
    }
  }, [location.search]);

  // Guardia de navegacion inteligente
  const navegarConGuardia = (
    destino: "mis_reclamos" | "nuevo" | "consulta" | "salir",
  ) => {
    if (destino === "salir") {
      setAlertaSalirAbierta(true);
      return;
    }

    if (
      vistaActiva === "nuevo" &&
      !reclamoCreadoExito &&
      formularioTieneDatos &&
      destino !== "nuevo"
    ) {
      setDestinoPendiente(destino);
      setAlertaDescarteAbierta(true);
      return;
    }

    ejecutarNavegacion(destino);
  };

  const ejecutarNavegacion = (
    destino: "mis_reclamos" | "nuevo" | "consulta" | "salir",
  ) => {
    setCategoria("");
    setDescripcion("");
    setUbicacion("");
    setFotoSimulada(false);
    setReclamoCreadoExito(null);

    if (destino === "mis_reclamos") {
      setVistaActiva("mis_reclamos");
    } else if (destino === "nuevo") {
      setVistaActiva("nuevo");
    } else if (destino === "consulta") {
      setVistaActiva("consulta");
    } else if (destino === "salir") {
      logout();
      history.push("/login");
    }
  };

  // Envia el nuevo reclamo al mock
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
    setVistaActiva("mis_reclamos");
    cargarReclamos();
  };

  const abrirDetalleReclamo = (r: IReport) => {
    setReclamoDetalle(r);
    setCalificacionTemp(r.calificacion || 0);
  };

  // Califica desde el modal de detalle
  const handleCalificarDesdeDetalle = async (puntuacion: number) => {
    if (!reclamoDetalle) return;
    setCalificacionTemp(puntuacion);
    await reportService.calificarRespuesta(reclamoDetalle.folio, {
      calificacion: puntuacion,
    });
    setToastMsg(`Calificación registrada: ${puntuacion} de 5 estrellas.`);

    const actualizado = await reportService.obtenerReclamoPorFolio(
      reclamoDetalle.folio,
    );
    if (actualizado) {
      setReclamoDetalle(actualizado);
    }
    cargarReclamos();
  };

  // Califica desde la seccion de consulta de folio
  const handleCalificarDesdeConsulta = async (puntuacion: number) => {
    if (!reporteConsulta) return;
    await reportService.calificarRespuesta(reporteConsulta.folio, {
      calificacion: puntuacion,
    });
    setToastMsg(`Calificación registrada: ${puntuacion} de 5 estrellas.`);

    const actualizado = await reportService.obtenerReclamoPorFolio(
      reporteConsulta.folio,
    );
    setReporteConsulta(actualizado);
    cargarReclamos();
  };

  // Buscador de folio integrado
  const handleBuscarFolioIntegrado = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!folioConsulta.trim()) return;

    setCargandoConsulta(true);
    setBusquedaRealizada(true);
    const resultado = await reportService.obtenerReclamoPorFolio(folioConsulta);
    setReporteConsulta(resultado);
    setCargandoConsulta(false);
  };

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
      {/* Barra superior en celular */}
      <IonHeader className="ion-no-border ion-hide-md-up">
        <IonToolbar style={{ "--background": "#0D3B66", padding: "4px 0" }}>
          <IonTitle
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            {vistaActiva === "nuevo"
              ? "Ingresar Reclamo"
              : vistaActiva === "consulta"
                ? "Consultar Folio"
                : "Mis Reclamos"}
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

      <IonContent style={{ "--background": "#F8FAFC" }}>
        <div style={{ display: "flex", minHeight: "100%" }}>
          <VecinoSidebar
            vistaActiva={vistaActiva}
            onNavegar={navegarConGuardia}
          />

          <main
            style={{
              flex: 1,
              padding: "24px 28px",
              maxWidth: "850px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* ========================================================= */}
            {/* VISTA 1: LISTADO DE MIS RECLAMOS                          */}
            {/* ========================================================= */}
            {vistaActiva === "mis_reclamos" && (
              <div>
                <div
                  style={{
                    margin: "0 0 16px 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h1
                      style={{
                        fontWeight: 800,
                        fontSize: "1.4rem",
                        color: "#0D3B66",
                        margin: "0 0 2px 0",
                      }}
                    >
                      Hola, {user?.nombre || "Vecino"}
                    </h1>
                    <p
                      style={{ margin: 0, fontSize: "13px", color: "#64748B" }}
                    >
                      Tus solicitudes comunales registradas
                    </p>
                  </div>

                  <span
                    style={{
                      background: "#0D3B66",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "4px 12px",
                      borderRadius: "12px",
                    }}
                  >
                    {reclamos.length}{" "}
                    {reclamos.length === 1 ? "reclamo" : "reclamos"}
                  </span>
                </div>

                {reclamos.length === 0 ? (
                  <IonCard
                    style={{
                      borderRadius: "14px",
                      textAlign: "center",
                      padding: "28px 16px",
                      border: "1px solid #E2E8F0",
                      background: "#FFFFFF",
                    }}
                  >
                    <IonText color="medium">
                      <p style={{ margin: "0 0 14px 0", fontSize: "14px" }}>
                        No tienes reclamos registrados actualmente.
                      </p>
                    </IonText>
                    <IonButton
                      style={{
                        "--background": "#0D3B66",
                        "--border-radius": "8px",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                      onClick={() => setVistaActiva("nuevo")}
                    >
                      <IonIcon slot="start" icon={addCircleOutline} />
                      Ingresar mi primer reclamo
                    </IonButton>
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
                        onClick={() => abrirDetalleReclamo(r)}
                        style={{
                          borderRadius: "14px",
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                          marginBottom: "12px",
                          cursor: "pointer",
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
                              <span
                                style={{ color: "#15803D", fontWeight: 700 }}
                              >
                                Resuelto (Ver solución)
                              </span>
                            )}
                          </div>
                        </IonCardContent>
                      </IonCard>
                    );
                  })
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* VISTA 2: FORMULARIO DE NUEVO RECLAMO                      */}
            {/* ========================================================= */}
            {vistaActiva === "nuevo" && (
              <div>
                {!reclamoCreadoExito ? (
                  <IonCard
                    style={{
                      borderRadius: "16px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                      overflow: "hidden",
                      margin: "0",
                    }}
                  >
                    <IonCardContent style={{ padding: "24px 22px" }}>
                      <div style={{ marginBottom: "18px" }}>
                        <h2
                          style={{
                            fontSize: "1.3rem",
                            fontWeight: 800,
                            color: "#0D3B66",
                            margin: "0 0 4px 0",
                          }}
                        >
                          Ingresar Solicitud Vecinal
                        </h2>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            color: "#64748B",
                          }}
                        >
                          Completa los antecedentes del reclamo para derivarlo a
                          la unidad municipal
                        </p>
                      </div>

                      <form onSubmit={handleEnviarReclamo}>
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
                              Descripcion del problema (*)
                            </label>
                            <small
                              style={{
                                color:
                                  descripcion.length >= 500
                                    ? "#DC2626"
                                    : "#64748B",
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
                              onIonInput={(e) =>
                                setDescripcion(e.detail.value!)
                              }
                            />
                          </IonItem>
                        </div>

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
                            Direccion o Referencia (*)
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
                    </IonCardContent>
                  </IonCard>
                ) : (
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
                      Volver a mis reclamos
                    </IonButton>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* VISTA 3: CONSULTAR FOLIO (CON ESTRELLAS INTERACTIVAS RF-09)*/}
            {/* ========================================================= */}
            {vistaActiva === "consulta" && (
              <div>
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
                  <IonCardContent style={{ padding: "24px 22px" }}>
                    <div style={{ marginBottom: "18px" }}>
                      <h2
                        style={{
                          fontSize: "1.3rem",
                          fontWeight: 800,
                          color: "#0D3B66",
                          margin: "0 0 4px 0",
                        }}
                      >
                        Consulta Ciudadana por Folio
                      </h2>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: "#64748B",
                        }}
                      >
                        Ingresa el código alfanumérico para revisar avances y
                        calificar respuestas
                      </p>
                    </div>

                    <form onSubmit={handleBuscarFolioIntegrado}>
                      <div
                        style={{
                          border: "1px solid #CBD5E1",
                          borderRadius: "8px",
                          overflow: "hidden",
                          background: "#FFFFFF",
                        }}
                      >
                        <IonSearchbar
                          value={folioConsulta}
                          onIonInput={(e) => setFolioConsulta(e.detail.value!)}
                          placeholder="Ej: SD-2026-000042"
                          showClearButton="focus"
                          style={{ "--background": "#FFFFFF", padding: "0" }}
                        />
                      </div>

                      <IonButton
                        expand="block"
                        type="submit"
                        disabled={cargandoConsulta || !folioConsulta.trim()}
                        style={{
                          "--background": "#0D3B66",
                          "--border-radius": "8px",
                          height: "46px",
                          fontWeight: 600,
                          fontSize: "14px",
                          marginTop: "12px",
                        }}
                      >
                        {cargandoConsulta ? (
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

                {/* Si no se encuentra */}
                {busquedaRealizada && !cargandoConsulta && !reporteConsulta && (
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
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#64748B",
                        margin: "0",
                      }}
                    >
                      Verifica que el código esté bien escrito e inténtalo
                      nuevamente.
                    </p>
                  </IonCard>
                )}

                {/* Resultado de la busqueda */}
                {reporteConsulta && (
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
                          #{reporteConsulta.folio}
                        </IonCardTitle>

                        <span
                          style={{
                            ...getBadgeStyle(reporteConsulta.estado),
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "4px 10px",
                            borderRadius: "6px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {reporteConsulta.estado}
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
                        {reporteConsulta.categoria}
                      </IonCardSubtitle>
                    </IonCardHeader>

                    <IonCardContent style={{ padding: "10px 20px 20px 20px" }}>
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
                            <strong>Ubicación:</strong>{" "}
                            {reporteConsulta.ubicacion}
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
                            {new Date(
                              reporteConsulta.fechaIngreso,
                            ).toLocaleDateString()}
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
                            {reporteConsulta.unidadAsignada || "OIRS Central"}
                          </span>
                        </div>
                      </div>

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
                          Descripción ingresada:
                        </span>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            color: "#1E293B",
                          }}
                        >
                          {reporteConsulta.descripcion}
                        </p>
                      </div>

                      {reporteConsulta.estado !== "Resuelto" && (
                        <div
                          style={{
                            background: reportService.calcularDiasRestantes(
                              reporteConsulta.fechaIngreso,
                            ).vencido
                              ? "#FEF2F2"
                              : "#F0F9FF",
                            borderLeft: `4px solid ${reportService.calcularDiasRestantes(reporteConsulta.fechaIngreso).vencido ? "#EF4444" : "#0284C7"}`,
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
                            style={{ fontSize: "20px", color: "#0284C7" }}
                          />
                          <span
                            style={{
                              fontSize: "13px",
                              color: "#0F172A",
                              fontWeight: 600,
                            }}
                          >
                            {
                              reportService.calcularDiasRestantes(
                                reporteConsulta.fechaIngreso,
                              ).diasRestantes
                            }{" "}
                            días restantes de plazo legal
                          </span>
                        </div>
                      )}

                      {/* Respuesta formal */}
                      {reporteConsulta.respuestaFormal && (
                        <div
                          style={{
                            background: "#F0FDF4",
                            borderLeft: "4px solid #2E7D32",
                            padding: "12px",
                            borderRadius: "0 8px 8px 0",
                            marginBottom: "16px",
                          }}
                        >
                          <strong
                            style={{ color: "#15803D", fontSize: "13px" }}
                          >
                            Respuesta Oficial Municipal:
                          </strong>
                          <p
                            style={{
                              margin: "6px 0 0 0",
                              color: "#166534",
                              fontSize: "14px",
                            }}
                          >
                            {reporteConsulta.respuestaFormal}
                          </p>
                        </div>
                      )}

                      {/* Calificacion en la consulta integrada (RF-09: una unica vez) */}
                      {reporteConsulta.estado === "Resuelto" && (
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
                              color: reporteConsulta.calificacion
                                ? "#15803D"
                                : "#64748B",
                              fontWeight: reporteConsulta.calificacion
                                ? 700
                                : 400,
                              margin: "0 0 8px 0",
                            }}
                          >
                            {reporteConsulta.calificacion
                              ? `Calificación registrada: ${reporteConsulta.calificacion} de 5 estrellas (completado)`
                              : "Selecciona las estrellas para evaluar la atención municipal"}
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
                                disabled={Boolean(reporteConsulta.calificacion)}
                                onClick={() =>
                                  handleCalificarDesdeConsulta(estrella)
                                }
                              >
                                <IonIcon
                                  slot="icon-only"
                                  icon={
                                    (reporteConsulta.calificacion || 0) >=
                                    estrella
                                      ? star
                                      : starOutline
                                  }
                                  style={{
                                    color:
                                      (reporteConsulta.calificacion || 0) >=
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

                      {/* Historial de avances */}
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
                          {reporteConsulta.historial.map((item, idx) => (
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
                                <p
                                  style={{ fontSize: "13px", color: "#475569" }}
                                >
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
            )}
          </main>
        </div>

        {/* MODAL: DETALLE COMPLETO AL TOCAR UNA TARJETA EN MIS RECLAMOS */}
        <IonModal
          isOpen={!!reclamoDetalle}
          onDidDismiss={() => setReclamoDetalle(null)}
        >
          <IonHeader className="ion-no-border">
            <IonToolbar style={{ "--background": "#0D3B66" }}>
              <IonButtons slot="start">
                <IonButton
                  onClick={() => setReclamoDetalle(null)}
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
                Detalle del Reclamo
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
            {reclamoDetalle && (
              <div
                style={{
                  maxWidth: "520px",
                  margin: "0 auto",
                  paddingBottom: "20px",
                }}
              >
                <IonCard
                  style={{
                    borderRadius: "16px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                    margin: "0 0 16px 0",
                  }}
                >
                  <IonCardContent style={{ padding: "20px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: "1.3rem",
                          fontWeight: 800,
                          color: "#0D3B66",
                          margin: 0,
                        }}
                      >
                        #{reclamoDetalle.folio}
                      </h2>
                      <span
                        style={{
                          background:
                            reclamoDetalle.estado === "Resuelto"
                              ? "#DCFCE7"
                              : "#FEF3C7",
                          color:
                            reclamoDetalle.estado === "Resuelto"
                              ? "#15803D"
                              : "#B45309",
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          textTransform: "uppercase",
                        }}
                      >
                        {reclamoDetalle.estado}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#1E293B",
                        margin: "8px 0 12px 0",
                      }}
                    >
                      {reclamoDetalle.categoria}
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        fontSize: "13px",
                        color: "#475569",
                        marginBottom: "14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <IonIcon icon={locationOutline} color="medium" />
                        <span>
                          <strong>Ubicacion:</strong> {reclamoDetalle.ubicacion}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <IonIcon icon={calendarOutline} color="medium" />
                        <span>
                          <strong>Ingresado:</strong>{" "}
                          {new Date(
                            reclamoDetalle.fechaIngreso,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <IonIcon icon={businessOutline} color="medium" />
                        <span>
                          <strong>Unidad asignada:</strong>{" "}
                          {reclamoDetalle.unidadAsignada || "OIRS Central"}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#F8FAFC",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #E2E8F0",
                        marginBottom: "14px",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "11px",
                          color: "#64748B",
                          textTransform: "uppercase",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Descripcion de tu solicitud:
                      </strong>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: "#1E293B",
                        }}
                      >
                        {reclamoDetalle.descripcion}
                      </p>
                    </div>

                    {reclamoDetalle.estado !== "Resuelto" && (
                      <div
                        style={{
                          background: reportService.calcularDiasRestantes(
                            reclamoDetalle.fechaIngreso,
                          ).vencido
                            ? "#FEF2F2"
                            : "#F0F9FF",
                          borderLeft: `4px solid ${reportService.calcularDiasRestantes(reclamoDetalle.fechaIngreso).vencido ? "#EF4444" : "#0284C7"}`,
                          padding: "10px 12px",
                          borderRadius: "0 8px 8px 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "14px",
                        }}
                      >
                        <IonIcon
                          icon={timeOutline}
                          style={{ fontSize: "20px", color: "#0284C7" }}
                        />
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#0F172A",
                            fontWeight: 600,
                          }}
                        >
                          {
                            reportService.calcularDiasRestantes(
                              reclamoDetalle.fechaIngreso,
                            ).diasRestantes
                          }{" "}
                          dias restantes de plazo legal
                        </span>
                      </div>
                    )}

                    {reclamoDetalle.respuestaFormal && (
                      <div
                        style={{
                          background: "#F0FDF4",
                          borderLeft: "4px solid #2E7D32",
                          padding: "12px",
                          borderRadius: "0 8px 8px 0",
                          marginBottom: "14px",
                        }}
                      >
                        <strong style={{ color: "#15803D", fontSize: "13px" }}>
                          Respuesta Formal de la Municipalidad:
                        </strong>
                        <p
                          style={{
                            margin: "4px 0 0 0",
                            color: "#166534",
                            fontSize: "13px",
                          }}
                        >
                          {reclamoDetalle.respuestaFormal}
                        </p>
                      </div>
                    )}

                    {/* Calificacion si esta resuelto (RF-09: una unica vez) */}
                    {reclamoDetalle.estado === "Resuelto" && (
                      <div
                        style={{
                          textAlign: "center",
                          borderTop: "1px solid #F1F5F9",
                          paddingTop: "14px",
                          marginTop: "14px",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#0D3B66",
                            margin: "0 0 4px 0",
                          }}
                        >
                          Califica nuestra solución
                        </h4>
                        <p
                          style={{
                            fontSize: "12px",
                            color: reclamoDetalle.calificacion
                              ? "#15803D"
                              : "#64748B",
                            fontWeight: reclamoDetalle.calificacion ? 700 : 400,
                            margin: "2px 0 6px 0",
                          }}
                        >
                          {reclamoDetalle.calificacion
                            ? `Calificación registrada: ${reclamoDetalle.calificacion} de 5 estrellas (completado)`
                            : "Selecciona una puntuación para evaluar la atención"}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "6px",
                            margin: "8px 0",
                          }}
                        >
                          {[1, 2, 3, 4, 5].map((estrella) => (
                            <IonButton
                              key={estrella}
                              fill="clear"
                              size="large"
                              disabled={Boolean(reclamoDetalle.calificacion)}
                              onClick={() =>
                                handleCalificarDesdeDetalle(estrella)
                              }
                            >
                              <IonIcon
                                slot="icon-only"
                                icon={
                                  (reclamoDetalle.calificacion ||
                                    calificacionTemp) >= estrella
                                    ? star
                                    : starOutline
                                }
                                style={{
                                  color:
                                    (reclamoDetalle.calificacion ||
                                      calificacionTemp) >= estrella
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

                    <div
                      style={{
                        borderTop: "1px solid #F1F5F9",
                        paddingTop: "14px",
                        marginTop: "14px",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "13px",
                          color: "#0F172A",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        Historial de avances:
                      </strong>
                      <IonList lines="none">
                        {reclamoDetalle.historial.map((item, idx) => (
                          <IonItem
                            key={idx}
                            className="ion-no-padding"
                            style={{
                              "--background": "transparent",
                              marginBottom: "6px",
                            }}
                          >
                            <IonIcon
                              icon={checkmarkCircleOutline}
                              slot="start"
                              color="primary"
                              style={{ fontSize: "18px" }}
                            />
                            <IonLabel>
                              <h4
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  color: "#1E293B",
                                  margin: 0,
                                }}
                              >
                                {item.estado}
                              </h4>
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "#475569",
                                  margin: "2px 0",
                                }}
                              >
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

                    <IonButton
                      expand="block"
                      fill="outline"
                      onClick={() => setReclamoDetalle(null)}
                      style={{
                        "--border-color": "#0D3B66",
                        "--color": "#0D3B66",
                        "--border-radius": "8px",
                        height: "42px",
                        fontWeight: 600,
                        marginTop: "16px",
                      }}
                    >
                      Volver a mis reclamos
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              </div>
            )}
          </IonContent>
        </IonModal>

        {/* ALERTA 1: GUARDIA DE DATOS NO GUARDADOS */}
        <IonAlert
          isOpen={alertaDescarteAbierta}
          onDidDismiss={() => setAlertaDescarteAbierta(false)}
          header="¿Descartar reclamo?"
          message="Tienes datos ingresados que aun no han sido enviados. Si sales ahora, se perderan los cambios."
          buttons={[
            {
              text: "Continuar escribiendo",
              role: "cancel",
              handler: () => setDestinoPendiente(null),
            },
            {
              text: "Descartar y salir",
              role: "destructive",
              handler: () => {
                if (destinoPendiente) {
                  ejecutarNavegacion(destinoPendiente);
                }
              },
            },
          ]}
        />

        {/* ALERTA 2: CONFIRMACION DE CIERRE DE SESION */}
        <IonAlert
          isOpen={alertaSalirAbierta}
          onDidDismiss={() => setAlertaSalirAbierta(false)}
          header="¿Cerrar sesión?"
          message="¿Está seguro de que desea salir de su cuenta vecinal?"
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

      {/* BARRA INFERIOR SIEMPRE PRESENTE EN CELULAR */}
      <IonFooter className="ion-hide-md-up">
        <IonTabBar
          slot="bottom"
          style={{
            borderTop: "1px solid #E2E8F0",
            height: "60px",
            "--background": "#FFFFFF",
          }}
        >
          {/* Pestaña 1: Mis Reclamos */}
          <IonTabButton
            tab="inicio"
            onClick={() => navegarConGuardia("mis_reclamos")}
            style={{
              "--color-selected": "#0D3B66",
            }}
          >
            <IonIcon
              icon={homeOutline}
              style={{
                color: vistaActiva === "mis_reclamos" ? "#0D3B66" : "#64748B",
              }}
            />
            <IonLabel
              style={{
                color: vistaActiva === "mis_reclamos" ? "#0D3B66" : "#64748B",
                fontWeight: vistaActiva === "mis_reclamos" ? 800 : 500,
              }}
            >
              Mis Reclamos
            </IonLabel>
          </IonTabButton>

          {/* Pestaña 2: Nuevo Reclamo */}
          <IonTabButton tab="nuevo" onClick={() => setVistaActiva("nuevo")}>
            <IonIcon
              icon={addCircleOutline}
              style={{ color: vistaActiva === "nuevo" ? "#0D3B66" : "#64748B" }}
            />
            <IonLabel
              style={{
                color: vistaActiva === "nuevo" ? "#0D3B66" : "#64748B",
                fontWeight: vistaActiva === "nuevo" ? 800 : 500,
              }}
            >
              Nuevo
            </IonLabel>
          </IonTabButton>

          {/* Pestaña 3: Consultar Folio */}
          <IonTabButton
            tab="consulta"
            onClick={() => navegarConGuardia("consulta")}
          >
            <IonIcon
              icon={searchOutline}
              style={{
                color: vistaActiva === "consulta" ? "#0D3B66" : "#64748B",
              }}
            />
            <IonLabel
              style={{
                color: vistaActiva === "consulta" ? "#0D3B66" : "#64748B",
                fontWeight: vistaActiva === "consulta" ? 800 : 500,
              }}
            >
              Consultar
            </IonLabel>
          </IonTabButton>

          {/* Pestaña 4: Cerrar Sesion */}
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

export default VecinoHomePage;
