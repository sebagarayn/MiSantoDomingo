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
  IonBadge,
  IonModal,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonSearchbar,
  IonText,
  IonToast,
} from "@ionic/react";
import {
  checkmarkCircleOutline,
  arrowBackOutline,
  swapHorizontalOutline,
  closeCircleOutline,
} from "ionicons/icons";
import { reportService } from "../../services/report.service";
import { IReport } from "../../types";

// Unidades exactas del Figma de PC
const UNIDADES_FIGMA = [
  "Salud",
  "Educación",
  "Obras municipales",
  "Desarrollo comunitario",
];

const AdminHomePage: React.FC = () => {
  const [reclamos, setReclamos] = useState<IReport[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [filtroUnidad, setFiltroUnidad] = useState("todos");

  // Detalle del reclamo seleccionado
  const [reclamoSeleccionado, setReclamoSeleccionado] =
    useState<IReport | null>(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  // Subflujo de Derivación (RF-07)
  const [pasoDerivacion, setPasoDerivacion] = useState<
    "none" | "elegir_unidad" | "motivo" | "exito"
  >("none");
  const [unidadElegida, setUnidadElegida] = useState("");
  const [motivoDerivacion, setMotivoDerivacion] = useState("");

  // Subflujo de Cierre Formal (RF-08)
  const [pasoCierre, setPasoCierre] = useState<
    "none" | "descripcion" | "exito"
  >("none");
  const [descripcionCierre, setDescripcionCierre] = useState("");

  const [toastMsg, setToastMsg] = useState("");

  const cargarDatos = async () => {
    const data = await reportService.obtenerReclamos();
    setReclamos(data);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrado reactivo combinado (RF-06)
  const reclamosFiltrados = reclamos.filter((r) => {
    const matchCat =
      filtroCategoria === "todos" ||
      r.categoria.toLowerCase().includes(filtroCategoria.toLowerCase());
    const matchUni =
      filtroUnidad === "todos" ||
      (r.unidadAsignada &&
        r.unidadAsignada.toLowerCase().includes(filtroUnidad.toLowerCase()));
    const matchTxt =
      busqueda.trim() === "" ||
      r.folio.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.ubicacion.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchUni && matchTxt;
  });

  const abrirDetalle = (r: IReport) => {
    setReclamoSeleccionado(r);
    setPasoDerivacion("none");
    setPasoCierre("none");
    setModalDetalleAbierto(true);
  };

  // Ejecución de Derivación (RF-07)
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

  // Ejecución de Cierre (RF-08)
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Panel OIRS — Reclamos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent
        className="ion-padding"
        style={{ backgroundColor: "#f4f5f8" }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {/* Título y Filtros superiores */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <h2 style={{ fontWeight: 700, margin: 0 }}>Reclamos</h2>
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div style={{ width: "220px" }}>
                <IonSearchbar
                  value={busqueda}
                  placeholder="Buscar folio o texto..."
                  onIonInput={(e) => setBusqueda(e.detail.value!)}
                  className="ion-no-padding"
                />
              </div>

              {/* Filtro Categoría */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "0 8px",
                }}
              >
                <IonSelect
                  value={filtroCategoria}
                  interface="popover"
                  onIonChange={(e) => setFiltroCategoria(e.detail.value)}
                >
                  <IonSelectOption value="todos">
                    Categoría: Todas
                  </IonSelectOption>
                  <IonSelectOption value="Alumbrado">
                    Alumbrado público
                  </IonSelectOption>
                  <IonSelectOption value="Aseo">Aseo y ornato</IonSelectOption>
                  <IonSelectOption value="Vialidad">
                    Vialidad y calles
                  </IonSelectOption>
                  <IonSelectOption value="Seguridad">Seguridad</IonSelectOption>
                </IonSelect>
              </div>

              {/* Filtro Unidad Responsable */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "0 8px",
                }}
              >
                <IonSelect
                  value={filtroUnidad}
                  interface="popover"
                  onIonChange={(e) => setFiltroUnidad(e.detail.value)}
                >
                  <IonSelectOption value="todos">Unidad: Todas</IonSelectOption>
                  {UNIDADES_FIGMA.map((u) => (
                    <IonSelectOption key={u} value={u}>
                      {u}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>
            </div>
          </div>

          {/* Tabla de Reclamos */}
          <IonCard
            style={{
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8f9fa",
                      borderBottom: "2px solid #e9ecef",
                      color: "#495057",
                    }}
                  >
                    <th style={{ padding: "14px 16px", fontWeight: 600 }}>
                      Folio
                    </th>
                    <th style={{ padding: "14px 16px", fontWeight: 600 }}>
                      Categoría
                    </th>
                    <th style={{ padding: "14px 16px", fontWeight: 600 }}>
                      Unidad Responsable
                    </th>
                    <th style={{ padding: "14px 16px", fontWeight: 600 }}>
                      Estado
                    </th>
                    <th style={{ padding: "14px 16px", fontWeight: 600 }}>
                      Días Restantes
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
                          color: "#777",
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
                            borderBottom: "1px solid #e9ecef",
                            cursor: "pointer",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#f1f3f5")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <td
                            style={{
                              padding: "14px 16px",
                              fontWeight: 700,
                              color: "#111",
                            }}
                          >
                            {r.folio}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            {r.categoria}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            {r.unidadAsignada || "OIRS Central"}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <IonBadge
                              color={
                                esResuelto
                                  ? "success"
                                  : r.estado === "Derivado"
                                    ? "primary"
                                    : "warning"
                              }
                              style={{
                                textTransform: "uppercase",
                                padding: "4px 8px",
                              }}
                            >
                              {r.estado}
                            </IonBadge>
                          </td>
                          <td
                            style={{
                              padding: "14px 16px",
                              fontWeight: 600,
                              color: esResuelto
                                ? "#2e7d32"
                                : vencido
                                  ? "#c62828"
                                  : "#333",
                            }}
                          >
                            {esResuelto
                              ? "0 (Resuelto)"
                              : vencido
                                ? `Vencido (${diasRestantes}d)`
                                : `${diasRestantes} días`}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </IonCard>
        </div>

        {/* MODAL PRINCIPAL: Detalle del reclamo */}
        <IonModal
          isOpen={modalDetalleAbierto}
          onDidDismiss={() => setModalDetalleAbierto(false)}
        >
          <IonHeader>
            <IonToolbar color="dark">
              <IonButtons slot="start">
                <IonButton onClick={() => setModalDetalleAbierto(false)}>
                  <IonIcon icon={arrowBackOutline} />
                </IonButton>
              </IonButtons>
              <IonTitle>Detalle del reclamo</IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            <div style={{ maxWidth: "640px", margin: "0 auto" }}>
              {/* VISTA 1: FICHA DE DATOS DEL RECLAMO */}
              {pasoDerivacion === "none" &&
                pasoCierre === "none" &&
                reclamoSeleccionado && (
                  <div>
                    <IonCard
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                        margin: "0 0 24px 0",
                        boxShadow: "none",
                      }}
                    >
                      <div
                        style={{
                          background: "#f5f5f5",
                          padding: "12px 16px",
                          borderBottom: "1px solid #ddd",
                          fontWeight: 700,
                          textAlign: "center",
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
                                color: "#777",
                                textTransform: "uppercase",
                              }}
                            >
                              Folio
                            </small>
                            <p style={{ margin: "2px 0 0 0", fontWeight: 700 }}>
                              {reclamoSeleccionado.folio}
                            </p>
                          </div>
                          <div>
                            <small
                              style={{
                                color: "#777",
                                textTransform: "uppercase",
                              }}
                            >
                              Categoría
                            </small>
                            <p style={{ margin: "2px 0 0 0", fontWeight: 600 }}>
                              {reclamoSeleccionado.categoria}
                            </p>
                          </div>
                          <div>
                            <small
                              style={{
                                color: "#777",
                                textTransform: "uppercase",
                              }}
                            >
                              Fecha de Ingreso
                            </small>
                            <p style={{ margin: "2px 0 0 0" }}>
                              {new Date(
                                reclamoSeleccionado.fechaIngreso,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <small
                              style={{
                                color: "#777",
                                textTransform: "uppercase",
                              }}
                            >
                              Unidad Responsable
                            </small>
                            <p style={{ margin: "2px 0 0 0", fontWeight: 600 }}>
                              {reclamoSeleccionado.unidadAsignada ||
                                "OIRS Central"}
                            </p>
                          </div>
                        </div>

                        <div
                          style={{
                            borderTop: "1px solid #eee",
                            paddingTop: "12px",
                            marginTop: "12px",
                          }}
                        >
                          <small
                            style={{
                              color: "#777",
                              textTransform: "uppercase",
                            }}
                          >
                            Motivo del reclamo (Descripción)
                          </small>
                          <p
                            style={{
                              margin: "4px 0 12px 0",
                              background: "#fafafa",
                              padding: "10px",
                              borderRadius: "6px",
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
                          <div>
                            <small
                              style={{
                                color: "#777",
                                textTransform: "uppercase",
                              }}
                            >
                              Estado Actual:{" "}
                            </small>
                            <IonBadge
                              color={
                                reclamoSeleccionado.estado === "Resuelto"
                                  ? "success"
                                  : "warning"
                              }
                            >
                              {reclamoSeleccionado.estado}
                            </IonBadge>
                          </div>
                        </div>

                        {reclamoSeleccionado.respuestaFormal && (
                          <div
                            style={{
                              marginTop: "16px",
                              background: "#e8f5e9",
                              padding: "12px",
                              borderRadius: "6px",
                            }}
                          >
                            <strong>Respuesta formal emitida:</strong>
                            <p style={{ margin: "4px 0 0 0" }}>
                              {reclamoSeleccionado.respuestaFormal}
                            </p>
                          </div>
                        )}
                      </IonCardContent>
                    </IonCard>

                    {/* Botones de acción del Figma: Cerrar Reclamo / Derivar Reclamo */}
                    {reclamoSeleccionado.estado !== "Resuelto" ? (
                      <div style={{ display: "flex", gap: "16px" }}>
                        <IonButton
                          expand="block"
                          color="dark"
                          style={{ flex: 1, height: "44px", fontWeight: 600 }}
                          onClick={() => setPasoCierre("descripcion")}
                        >
                          Cerrar Reclamo
                        </IonButton>

                        <IonButton
                          expand="block"
                          color="dark"
                          style={{ flex: 1, height: "44px", fontWeight: 600 }}
                          onClick={() => setPasoDerivacion("elegir_unidad")}
                        >
                          Derivar Reclamo
                        </IonButton>
                      </div>
                    ) : (
                      <IonButton
                        expand="block"
                        fill="outline"
                        color="dark"
                        onClick={() => setModalDetalleAbierto(false)}
                      >
                        Volver a la lista
                      </IonButton>
                    )}
                  </div>
                )}

              {/* SUBFLUJO DERIVAR PASO 1 */}
              {pasoDerivacion === "elegir_unidad" && (
                <div className="ion-text-center">
                  <h3 style={{ fontWeight: 700, marginBottom: "20px" }}>
                    Seleccione la unidad
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      marginBottom: "24px",
                    }}
                  >
                    {UNIDADES_FIGMA.map((u) => (
                      <IonButton
                        key={u}
                        expand="block"
                        color={unidadElegida === u ? "dark" : "medium"}
                        fill={unidadElegida === u ? "solid" : "outline"}
                        onClick={() => setUnidadElegida(u)}
                        style={{ height: "46px", fontWeight: 600 }}
                      >
                        {u}
                      </IonButton>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <IonButton
                      expand="block"
                      fill="clear"
                      color="medium"
                      style={{ flex: 1 }}
                      onClick={() => setPasoDerivacion("none")}
                    >
                      Regresar
                    </IonButton>
                    <IonButton
                      expand="block"
                      color="dark"
                      style={{ flex: 1, fontWeight: 600 }}
                      disabled={!unidadElegida}
                      onClick={() => setPasoDerivacion("motivo")}
                    >
                      Elegir Unidad
                    </IonButton>
                  </div>
                </div>
              )}

              {/* SUBFLUJO DERIVAR PASO 2 */}
              {pasoDerivacion === "motivo" && (
                <div>
                  <h3
                    style={{
                      fontWeight: 700,
                      textAlign: "center",
                      marginBottom: "16px",
                    }}
                  >
                    Motivo de la derivación del reclamo
                  </h3>
                  <p
                    style={{
                      textAlign: "center",
                      color: "#666",
                      fontSize: "14px",
                      marginTop: 0,
                    }}
                  >
                    Unidad destino: <strong>{unidadElegida}</strong>
                  </p>

                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "8px",
                      marginBottom: "20px",
                    }}
                  >
                    <IonTextarea
                      rows={6}
                      placeholder="Ingrese los antecedentes y justificación de la derivación..."
                      value={motivoDerivacion}
                      onIonInput={(e) => setMotivoDerivacion(e.detail.value!)}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <IonButton
                      expand="block"
                      fill="clear"
                      color="medium"
                      style={{ flex: 1 }}
                      onClick={() => setPasoDerivacion("elegir_unidad")}
                    >
                      Regresar
                    </IonButton>
                    <IonButton
                      expand="block"
                      color="dark"
                      style={{ flex: 1, fontWeight: 600 }}
                      onClick={handleConfirmarDerivacion}
                    >
                      Aceptar
                    </IonButton>
                  </div>
                </div>
              )}

              {/* SUBFLUJO DERIVAR PASO 3: SUCCESS */}
              {pasoDerivacion === "exito" && (
                <div
                  className="ion-text-center"
                  style={{ padding: "30px 10px" }}
                >
                  <IonIcon
                    icon={checkmarkCircleOutline}
                    style={{ fontSize: "72px", color: "#555" }}
                  />
                  <h3
                    style={{
                      letterSpacing: "2px",
                      fontWeight: 800,
                      margin: "16px 0 8px 0",
                    }}
                  >
                    SUCCESS
                  </h3>
                  <p
                    style={{
                      color: "#444",
                      fontSize: "16px",
                      margin: "0 0 24px 0",
                    }}
                  >
                    Reclamo derivado con éxito a{" "}
                    <strong>{unidadElegida}</strong>
                  </p>
                  <IonButton
                    color="dark"
                    onClick={() => {
                      setPasoDerivacion("none");
                      setModalDetalleAbierto(false);
                    }}
                  >
                    Volver a reclamos
                  </IonButton>
                </div>
              )}

              {/* SUBFLUJO CIERRE PASO 1 */}
              {pasoCierre === "descripcion" && (
                <div>
                  <h3
                    style={{
                      fontWeight: 700,
                      textAlign: "center",
                      marginBottom: "16px",
                    }}
                  >
                    Descripción del cierre de reclamo
                  </h3>
                  <p
                    style={{
                      textAlign: "center",
                      color: "#666",
                      fontSize: "13px",
                      marginTop: 0,
                    }}
                  >
                    Esta respuesta formal quedará visible de inmediato para el
                    vecino.
                  </p>

                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "8px",
                      marginBottom: "20px",
                    }}
                  >
                    <IonTextarea
                      rows={6}
                      placeholder="Detalle la solución municipal ejecutada..."
                      value={descripcionCierre}
                      onIonInput={(e) => setDescripcionCierre(e.detail.value!)}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <IonButton
                      expand="block"
                      fill="clear"
                      color="medium"
                      style={{ flex: 1 }}
                      onClick={() => setPasoCierre("none")}
                    >
                      Regresar
                    </IonButton>
                    <IonButton
                      expand="block"
                      color="dark"
                      style={{ flex: 1, fontWeight: 600 }}
                      onClick={handleConfirmarCierre}
                    >
                      Cerrar reclamo
                    </IonButton>
                  </div>
                </div>
              )}

              {/* SUBFLUJO CIERRE PASO 2: SUCCESS */}
              {pasoCierre === "exito" && (
                <div
                  className="ion-text-center"
                  style={{ padding: "30px 10px" }}
                >
                  <IonIcon
                    icon={checkmarkCircleOutline}
                    style={{ fontSize: "72px", color: "#555" }}
                  />
                  <h3
                    style={{
                      letterSpacing: "2px",
                      fontWeight: 800,
                      margin: "16px 0 8px 0",
                    }}
                  >
                    SUCCESS
                  </h3>
                  <p
                    style={{
                      color: "#444",
                      fontSize: "16px",
                      margin: "0 0 24px 0",
                    }}
                  >
                    Reclamo cerrado con éxito
                  </p>
                  <IonButton
                    color="dark"
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

export default AdminHomePage;
