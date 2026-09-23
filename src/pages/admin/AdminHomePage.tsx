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
  IonCardContent,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonSearchbar,
  IonToast,
  IonFooter,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonAlert,
} from "@ionic/react";
import {
  checkmarkCircleOutline,
  arrowBackOutline,
  clipboardOutline,
  statsChartOutline,
  logOutOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { reportService } from "../../services/report.service";
import { IReport } from "../../types";
import AdminSidebar from "../../components/AdminSidebar";

// Unidades para el filtro de la tabla (incluye OIRS Central de entrada)
const UNIDADES_FILTRO = [
  "OIRS Central",
  "Obras municipales",
  "Salud",
  "Educación",
  "Desarrollo comunitario",
];

// Unidades de destino para derivar un reclamo
const UNIDADES_DERIVACION = [
  "Obras municipales",
  "Salud",
  "Educación",
  "Desarrollo comunitario",
];

// Categorias oficiales definidas en el Figma
const CATEGORIAS_OFICIALES = [
  "Alumbrado público",
  "Aseo y ornato",
  "Calles y veredas",
  "Seguridad",
  "Transporte",
  "Otros",
];

const AdminHomePage: React.FC = () => {
  const history = useHistory();
  const { logout } = useAuth();

  // Estados para datos y filtros
  const [reclamos, setReclamos] = useState<IReport[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [filtroUnidad, setFiltroUnidad] = useState("todos");

  // Reclamo seleccionado para ver detalle
  const [reclamoSeleccionado, setReclamoSeleccionado] =
    useState<IReport | null>(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  // Subflujos de derivacion y cierre formal
  const [pasoDerivacion, setPasoDerivacion] = useState<
    "none" | "elegir_unidad" | "motivo" | "exito"
  >("none");
  const [unidadElegida, setUnidadElegida] = useState("");
  const [motivoDerivacion, setMotivoDerivacion] = useState("");

  const [pasoCierre, setPasoCierre] = useState<
    "none" | "descripcion" | "exito"
  >("none");
  const [descripcionCierre, setDescripcionCierre] = useState("");

  // Alertas y mensajes
  const [alertaSalirAbierta, setAlertaSalirAbierta] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Carga los reclamos del mock al montar la vista
  const cargarDatos = async () => {
    const data = await reportService.obtenerReclamos();
    setReclamos(data);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtra por categoria, unidad o busqueda de texto
  const reclamosFiltrados = reclamos.filter((r) => {
    const matchCat =
      filtroCategoria === "todos" || r.categoria === filtroCategoria;
    const matchUni =
      filtroUnidad === "todos" || r.unidadAsignada === filtroUnidad;
    const matchTxt =
      busqueda.trim() === "" ||
      r.folio.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.ubicacion.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchUni && matchTxt;
  });

  // Abre el modal con la ficha del reclamo
  const abrirDetalle = (r: IReport) => {
    setReclamoSeleccionado(r);
    setPasoDerivacion("none");
    setPasoCierre("none");
    setModalDetalleAbierto(true);
  };

  // Guarda la derivacion en el servicio
  const handleConfirmarDerivacion = async () => {
    if (!reclamoSeleccionado || !unidadElegida || !motivoDerivacion.trim()) {
      setToastMsg("Debe ingresar el motivo de la derivación.");
      return;
    }

    const actualizado = await reportService.actualizarEstado(
      reclamoSeleccionado.folio,
      {
        estado: "Derivado",
        unidadAsignada: unidadElegida,
        observacion: motivoDerivacion,
        responsableId: "Felipe OIRS",
      },
    );

    setReclamoSeleccionado(actualizado);
    setPasoDerivacion("exito");
    cargarDatos();
  };

  // Guarda la respuesta formal y cierra el reclamo
  const handleConfirmarCierre = async () => {
    if (!reclamoSeleccionado || !descripcionCierre.trim()) {
      setToastMsg("Debe ingresar la descripción formal del cierre.");
      return;
    }

    const actualizado = await reportService.actualizarEstado(
      reclamoSeleccionado.folio,
      {
        estado: "Resuelto",
        observacion: "Reclamo resuelto formalmente.",
        responsableId: "Felipe OIRS",
      },
      descripcionCierre,
    );

    setReclamoSeleccionado(actualizado);
    setPasoCierre("exito");
    cargarDatos();
  };

  // Colores limpios para los estados
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
      {/* Cabecera solo para celulares, en PC se oculta */}
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
            Panel OIRS
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
        {/* Contenedor Flex: barra lateral en PC y tabla a la derecha */}
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
            {/* Titulo y barra de filtros */}
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
                  Reclamos Ingresados
                </h1>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748B" }}>
                  Bandeja de gestion y derivacion municipal
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {/* Buscador de texto */}
                <div
                  style={{
                    width: "200px",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    overflow: "hidden",
                    background: "#FFFFFF",
                  }}
                >
                  <IonSearchbar
                    value={busqueda}
                    placeholder="Buscar folio o texto..."
                    onIonInput={(e) => setBusqueda(e.detail.value!)}
                    style={{ "--background": "#FFFFFF", padding: "0" }}
                  />
                </div>

                {/* Filtro de categorias oficiales */}
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    padding: "2px 8px",
                  }}
                >
                  <IonSelect
                    value={filtroCategoria}
                    interface="popover"
                    onIonChange={(e) => setFiltroCategoria(e.detail.value)}
                    style={{
                      fontSize: "13px",
                      color: "#0D3B66",
                      fontWeight: 600,
                    }}
                  >
                    <IonSelectOption value="todos">
                      Categoría: Todas
                    </IonSelectOption>
                    {CATEGORIAS_OFICIALES.map((cat) => (
                      <IonSelectOption key={cat} value={cat}>
                        {cat}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </div>

                {/* Filtro de unidades sincronizadas */}
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    padding: "2px 8px",
                  }}
                >
                  <IonSelect
                    value={filtroUnidad}
                    interface="popover"
                    onIonChange={(e) => setFiltroUnidad(e.detail.value)}
                    style={{
                      fontSize: "13px",
                      color: "#0D3B66",
                      fontWeight: 600,
                    }}
                  >
                    <IonSelectOption value="todos">
                      Unidad: Todas
                    </IonSelectOption>
                    {UNIDADES_FILTRO.map((u) => (
                      <IonSelectOption key={u} value={u}>
                        {u}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </div>
              </div>
            </div>

            {/* Tabla de reclamos */}
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
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                    fontSize: "13px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#F1F5F9",
                        borderBottom: "2px solid #E2E8F0",
                        color: "#334155",
                      }}
                    >
                      <th style={{ padding: "14px 16px", fontWeight: 700 }}>
                        FOLIO
                      </th>
                      <th style={{ padding: "14px 16px", fontWeight: 700 }}>
                        CATEGORIA
                      </th>
                      <th style={{ padding: "14px 16px", fontWeight: 700 }}>
                        UNIDAD RESPONSABLE
                      </th>
                      <th style={{ padding: "14px 16px", fontWeight: 700 }}>
                        ESTADO
                      </th>
                      <th style={{ padding: "14px 16px", fontWeight: 700 }}>
                        DIAS RESTANTES
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reclamosFiltrados.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "24px",
                            textAlign: "center",
                            color: "#64748B",
                          }}
                        >
                          No se encontraron reclamos con los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      reclamosFiltrados.map((r) => {
                        const { diasRestantes, vencido } =
                          reportService.calcularDiasRestantes(r.fechaIngreso);
                        const esResuelto = r.estado === "Resuelto";

                        return (
                          <tr
                            key={r.folio}
                            onClick={() => abrirDetalle(r)}
                            style={{
                              borderBottom: "1px solid #E2E8F0",
                              cursor: "pointer",
                              transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#F8FAFC")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <td
                              style={{
                                padding: "14px 16px",
                                fontWeight: 800,
                                color: "#0D3B66",
                              }}
                            >
                              {r.folio}
                            </td>
                            <td
                              style={{
                                padding: "14px 16px",
                                color: "#1E293B",
                                fontWeight: 600,
                              }}
                            >
                              {r.categoria}
                            </td>
                            <td
                              style={{ padding: "14px 16px", color: "#475569" }}
                            >
                              {r.unidadAsignada || "OIRS Central"}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <span
                                style={{
                                  ...getBadgeStyle(r.estado),
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  textTransform: "uppercase",
                                }}
                              >
                                {r.estado}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "14px 16px",
                                fontWeight: 700,
                                color: esResuelto
                                  ? "#15803D"
                                  : vencido
                                    ? "#DC2626"
                                    : "#D97706",
                              }}
                            >
                              {esResuelto
                                ? "0 (Resuelto)"
                                : vencido
                                  ? `Vencido (${diasRestantes}d)`
                                  : `${diasRestantes} dias`}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </IonCard>
          </main>
        </div>

        {/* Modal: Detalle del reclamo */}
        <IonModal
          isOpen={modalDetalleAbierto}
          onDidDismiss={() => setModalDetalleAbierto(false)}
        >
          <IonHeader className="ion-no-border">
            <IonToolbar style={{ "--background": "#0D3B66" }}>
              <IonButtons slot="start">
                <IonButton
                  onClick={() => setModalDetalleAbierto(false)}
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
                Detalle del reclamo
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
            <div style={{ maxWidth: "640px", margin: "0 auto" }}>
              {pasoDerivacion === "none" &&
                pasoCierre === "none" &&
                reclamoSeleccionado && (
                  <div>
                    <IonCard
                      style={{
                        borderRadius: "16px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                        margin: "0 0 20px 0",
                      }}
                    >
                      <div
                        style={{
                          background: "#F1F5F9",
                          padding: "12px 16px",
                          borderBottom: "1px solid #E2E8F0",
                          fontWeight: 800,
                          color: "#0D3B66",
                          textAlign: "center",
                          fontSize: "13px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Datos del reclamo
                      </div>

                      <IonCardContent style={{ padding: "20px" }}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "14px",
                            marginBottom: "14px",
                          }}
                        >
                          <div>
                            <small
                              style={{
                                color: "#64748B",
                                textTransform: "uppercase",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              Folio
                            </small>
                            <p
                              style={{
                                margin: "2px 0 0 0",
                                fontWeight: 800,
                                color: "#0D3B66",
                              }}
                            >
                              {reclamoSeleccionado.folio}
                            </p>
                          </div>
                          <div>
                            <small
                              style={{
                                color: "#64748B",
                                textTransform: "uppercase",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              Categoria
                            </small>
                            <p
                              style={{
                                margin: "2px 0 0 0",
                                fontWeight: 600,
                                color: "#1E293B",
                              }}
                            >
                              {reclamoSeleccionado.categoria}
                            </p>
                          </div>
                          <div>
                            <small
                              style={{
                                color: "#64748B",
                                textTransform: "uppercase",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              Fecha de Ingreso
                            </small>
                            <p
                              style={{ margin: "2px 0 0 0", color: "#475569" }}
                            >
                              {new Date(
                                reclamoSeleccionado.fechaIngreso,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <small
                              style={{
                                color: "#64748B",
                                textTransform: "uppercase",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              Unidad Responsable
                            </small>
                            <p
                              style={{
                                margin: "2px 0 0 0",
                                fontWeight: 600,
                                color: "#0D3B66",
                              }}
                            >
                              {reclamoSeleccionado.unidadAsignada ||
                                "OIRS Central"}
                            </p>
                          </div>
                        </div>

                        <div
                          style={{
                            borderTop: "1px solid #F1F5F9",
                            paddingTop: "12px",
                            marginTop: "12px",
                          }}
                        >
                          <small
                            style={{
                              color: "#64748B",
                              textTransform: "uppercase",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            Motivo del reclamo
                          </small>
                          <p
                            style={{
                              margin: "4px 0 12px 0",
                              background: "#F8FAFC",
                              padding: "10px",
                              borderRadius: "8px",
                              border: "1px solid #E2E8F0",
                              color: "#1E293B",
                              fontSize: "13px",
                            }}
                          >
                            {reclamoSeleccionado.descripcion}
                          </p>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#64748B",
                              fontWeight: 600,
                            }}
                          >
                            Estado Actual:
                          </span>
                          <span
                            style={{
                              ...getBadgeStyle(reclamoSeleccionado.estado),
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: "6px",
                              textTransform: "uppercase",
                            }}
                          >
                            {reclamoSeleccionado.estado}
                          </span>
                        </div>

                        {reclamoSeleccionado.respuestaFormal && (
                          <div
                            style={{
                              marginTop: "16px",
                              background: "#F0FDF4",
                              borderLeft: "4px solid #2E7D32",
                              padding: "12px",
                              borderRadius: "0 8px 8px 0",
                            }}
                          >
                            <strong
                              style={{ color: "#15803D", fontSize: "13px" }}
                            >
                              Respuesta formal emitida:
                            </strong>
                            <p
                              style={{
                                margin: "4px 0 0 0",
                                color: "#166534",
                                fontSize: "13px",
                              }}
                            >
                              {reclamoSeleccionado.respuestaFormal}
                            </p>
                          </div>
                        )}
                      </IonCardContent>
                    </IonCard>

                    {/* Acciones principales de gestion */}
                    {reclamoSeleccionado.estado !== "Resuelto" ? (
                      <div style={{ display: "flex", gap: "12px" }}>
                        <IonButton
                          expand="block"
                          fill="outline"
                          style={{
                            flex: 1,
                            height: "46px",
                            fontWeight: 600,
                            fontSize: "14px",
                            "--border-color": "#0D3B66",
                            "--color": "#0D3B66",
                            "--border-radius": "8px",
                          }}
                          onClick={() => setPasoDerivacion("elegir_unidad")}
                        >
                          Derivar Reclamo
                        </IonButton>

                        <IonButton
                          expand="block"
                          style={{
                            flex: 1,
                            height: "46px",
                            fontWeight: 600,
                            fontSize: "14px",
                            "--background": "#2E7D32",
                            "--border-radius": "8px",
                          }}
                          onClick={() => setPasoCierre("descripcion")}
                        >
                          Cerrar Reclamo
                        </IonButton>
                      </div>
                    ) : (
                      <IonButton
                        expand="block"
                        fill="outline"
                        style={{
                          "--border-color": "#0D3B66",
                          "--color": "#0D3B66",
                          "--border-radius": "8px",
                          height: "44px",
                          fontWeight: 600,
                        }}
                        onClick={() => setModalDetalleAbierto(false)}
                      >
                        Volver a la lista
                      </IonButton>
                    )}
                  </div>
                )}

              {/* Subflujo derivacion: Seleccionar unidad de destino */}
              {pasoDerivacion === "elegir_unidad" && (
                <div style={{ textAlign: "center" }}>
                  <h3
                    style={{
                      fontWeight: 800,
                      color: "#0D3B66",
                      marginBottom: "16px",
                    }}
                  >
                    Seleccione la unidad
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      marginBottom: "20px",
                    }}
                  >
                    {UNIDADES_DERIVACION.map((u) => (
                      <IonButton
                        key={u}
                        expand="block"
                        fill={unidadElegida === u ? "solid" : "outline"}
                        style={{
                          height: "46px",
                          fontWeight: 600,
                          "--background":
                            unidadElegida === u ? "#0D3B66" : "transparent",
                          "--color":
                            unidadElegida === u ? "#FFFFFF" : "#0D3B66",
                          "--border-color": "#0D3B66",
                          "--border-radius": "8px",
                        }}
                        onClick={() => setUnidadElegida(u)}
                      >
                        {u}
                      </IonButton>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <IonButton
                      expand="block"
                      fill="clear"
                      style={{ flex: 1, "--color": "#64748B", fontWeight: 600 }}
                      onClick={() => setPasoDerivacion("none")}
                    >
                      Regresar
                    </IonButton>

                    <IonButton
                      expand="block"
                      style={{
                        flex: 1,
                        "--background": "#0D3B66",
                        "--border-radius": "8px",
                        height: "44px",
                        fontWeight: 600,
                      }}
                      disabled={!unidadElegida}
                      onClick={() => setPasoDerivacion("motivo")}
                    >
                      Elegir Unidad
                    </IonButton>
                  </div>
                </div>
              )}

              {/* Subflujo derivacion: Redactar motivo */}
              {pasoDerivacion === "motivo" && (
                <div>
                  <h3
                    style={{
                      fontWeight: 800,
                      color: "#0D3B66",
                      textAlign: "center",
                      margin: "0 0 6px 0",
                    }}
                  >
                    Motivo de la derivacion
                  </h3>
                  <p
                    style={{
                      textAlign: "center",
                      color: "#64748B",
                      fontSize: "13px",
                      margin: "0 0 16px 0",
                    }}
                  >
                    Unidad de destino:{" "}
                    <strong style={{ color: "#0D3B66" }}>
                      {unidadElegida}
                    </strong>
                  </p>

                  <div
                    style={{
                      border: "1px solid #CBD5E1",
                      borderRadius: "8px",
                      padding: "6px",
                      background: "#FFFFFF",
                      marginBottom: "20px",
                    }}
                  >
                    <IonTextarea
                      rows={5}
                      placeholder="Ingrese los antecedentes para la unidad responsable..."
                      value={motivoDerivacion}
                      onIonInput={(e) => setMotivoDerivacion(e.detail.value!)}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <IonButton
                      expand="block"
                      fill="clear"
                      style={{ flex: 1, "--color": "#64748B", fontWeight: 600 }}
                      onClick={() => setPasoDerivacion("elegir_unidad")}
                    >
                      Regresar
                    </IonButton>

                    <IonButton
                      expand="block"
                      style={{
                        flex: 1,
                        "--background": "#0D3B66",
                        "--border-radius": "8px",
                        height: "44px",
                        fontWeight: 600,
                      }}
                      onClick={handleConfirmarDerivacion}
                    >
                      Aceptar
                    </IonButton>
                  </div>
                </div>
              )}

              {/* Success de derivacion */}
              {pasoDerivacion === "exito" && (
                <div style={{ textAlign: "center", padding: "24px 10px" }}>
                  <IonIcon
                    icon={checkmarkCircleOutline}
                    style={{ fontSize: "72px", color: "#2E7D32" }}
                  />
                  <h3
                    style={{
                      letterSpacing: "2px",
                      fontWeight: 800,
                      margin: "14px 0 6px 0",
                      color: "#0D3B66",
                    }}
                  >
                    SUCCESS
                  </h3>
                  <p
                    style={{
                      color: "#475569",
                      fontSize: "14px",
                      margin: "0 0 20px 0",
                    }}
                  >
                    Reclamo derivado con exito a{" "}
                    <strong>{unidadElegida}</strong>
                  </p>
                  <IonButton
                    style={{
                      "--background": "#0D3B66",
                      "--border-radius": "8px",
                      height: "44px",
                      fontWeight: 600,
                    }}
                    onClick={() => {
                      setPasoDerivacion("none");
                      setModalDetalleAbierto(false);
                    }}
                  >
                    Volver a reclamos
                  </IonButton>
                </div>
              )}

              {/* Subflujo cierre: Respuesta formal */}
              {pasoCierre === "descripcion" && (
                <div>
                  <h3
                    style={{
                      fontWeight: 800,
                      color: "#0D3B66",
                      textAlign: "center",
                      margin: "0 0 6px 0",
                    }}
                  >
                    Descripcion del cierre de reclamo
                  </h3>
                  <p
                    style={{
                      textAlign: "center",
                      color: "#64748B",
                      fontSize: "13px",
                      margin: "0 0 16px 0",
                    }}
                  >
                    Esta respuesta formal quedara visible de inmediato para el
                    vecino.
                  </p>

                  <div
                    style={{
                      border: "1px solid #CBD5E1",
                      borderRadius: "8px",
                      padding: "6px",
                      background: "#FFFFFF",
                      marginBottom: "20px",
                    }}
                  >
                    <IonTextarea
                      rows={5}
                      placeholder="Detalle los trabajos o solucion municipal ejecutada..."
                      value={descripcionCierre}
                      onIonInput={(e) => setDescripcionCierre(e.detail.value!)}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <IonButton
                      expand="block"
                      fill="clear"
                      style={{ flex: 1, "--color": "#64748B", fontWeight: 600 }}
                      onClick={() => setPasoCierre("none")}
                    >
                      Regresar
                    </IonButton>

                    <IonButton
                      expand="block"
                      style={{
                        flex: 1,
                        "--background": "#2E7D32",
                        "--border-radius": "8px",
                        height: "44px",
                        fontWeight: 600,
                      }}
                      onClick={handleConfirmarCierre}
                    >
                      Cerrar reclamo
                    </IonButton>
                  </div>
                </div>
              )}

              {/* Success de cierre */}
              {pasoCierre === "exito" && (
                <div style={{ textAlign: "center", padding: "24px 10px" }}>
                  <IonIcon
                    icon={checkmarkCircleOutline}
                    style={{ fontSize: "72px", color: "#2E7D32" }}
                  />
                  <h3
                    style={{
                      letterSpacing: "2px",
                      fontWeight: 800,
                      margin: "14px 0 6px 0",
                      color: "#0D3B66",
                    }}
                  >
                    SUCCESS
                  </h3>
                  <p
                    style={{
                      color: "#475569",
                      fontSize: "14px",
                      margin: "0 0 20px 0",
                    }}
                  >
                    Reclamo cerrado con exito
                  </p>
                  <IonButton
                    style={{
                      "--background": "#0D3B66",
                      "--border-radius": "8px",
                      height: "44px",
                      fontWeight: 600,
                    }}
                    onClick={() => {
                      setPasoCierre("none");
                    }}
                  >
                    Volver al reclamo
                  </IonButton>
                </div>
              )}
            </div>
          </IonContent>
        </IonModal>

        {/* Alerta de confirmacion de salida */}
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

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={2500}
          onDidDismiss={() => setToastMsg("")}
        />
      </IonContent>

      {/* Barra inferior visible solo en celular (Admin movil) */}
      <IonFooter className="ion-hide-md-up">
        <IonTabBar
          slot="bottom"
          style={{
            borderTop: "1px solid #E2E8F0",
            height: "60px",
            "--background": "#FFFFFF",
          }}
        >
          {/* Pestana 1: Reclamos (ACTIVA) */}
          <IonTabButton
            tab="reclamos"
            style={{ "--color-selected": "#0D3B66" }}
          >
            <IonIcon icon={clipboardOutline} style={{ color: "#0D3B66" }} />
            <IonLabel style={{ color: "#0D3B66", fontWeight: 800 }}>
              Reclamos
            </IonLabel>
          </IonTabButton>

          {/* Pestana 2: Metricas */}
          <IonTabButton
            tab="metricas"
            onClick={() => history.push("/admin/dashboard")}
          >
            <IonIcon icon={statsChartOutline} style={{ color: "#64748B" }} />
            <IonLabel style={{ color: "#64748B", fontWeight: 500 }}>
              Métricas
            </IonLabel>
          </IonTabButton>

          {/* Pestana 3: Salir con alerta */}
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

export default AdminHomePage;
