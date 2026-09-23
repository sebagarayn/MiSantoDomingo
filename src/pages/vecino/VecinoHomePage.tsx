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
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonText,
  IonToast,
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
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { reportService } from "../../services/report.service";
import { IReport } from "../../types";

// Categorías Figma móvil
const CATEGORIAS_FIGMA = [
  "Alumbrado público",
  "Aseo y ornato",
  "Calles y veredas",
  "Seguridad",
  "Transporte",
  "Otros",
];

const VecinoHomePage: React.FC = () => {
  const { user } = useAuth();
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

  const cargarReclamos = async () => {
    const data = await reportService.obtenerReclamos();
    // Reclamos creados por el vecino
    setReclamos(
      data.filter((r) => r.creadorId === user?.id || r.origen === "usuario"),
    );
  };

  useEffect(() => {
    cargarReclamos();
  }, []);

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

    // Agrega el reclamo de inmediato arriba en la lista reactiva
    setReclamos((prev) => [nuevo, ...prev]);
    setReclamoCreadoExito(nuevo);

    // Limpiar formulario
    setCategoria("");
    setDescripcion("");
    setUbicacion("");
    setFotoSimulada(false);
  };

  const cerrarFlujoExito = () => {
    setReclamoCreadoExito(null);
    setModalCrearAbierto(false);
    cargarReclamos(); // Vuelve a sincronizar con storage
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>MiSantoDomingo</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div style={{ maxWidth: "520px", margin: "0 auto" }}>
          {/* Bienvenida */}
          <div style={{ margin: "10px 0 20px 0" }}>
            <h2 style={{ fontWeight: 700, margin: "0 0 4px 0" }}>
              Hola, {user?.nombre || "Vecino"}
            </h2>
            <IonText color="medium">
              <p style={{ margin: 0 }}>
                Portal de atención y seguimiento comunal
              </p>
            </IonText>
          </div>

          {/* Menú "¿Qué desea hacer?" */}
          <IonCard
            style={{
              borderRadius: "16px",
              margin: "0 0 24px 0",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            <IonCardContent>
              <h3
                style={{ fontWeight: 700, marginBottom: "16px", color: "#111" }}
              >
                ¿Qué desea hacer?
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <IonButton
                  expand="block"
                  color="dark"
                  style={{ height: "48px", fontWeight: 600 }}
                  onClick={() => setModalCrearAbierto(true)}
                >
                  <IonIcon slot="start" icon={addCircleOutline} />
                  Ingresar un reclamo
                </IonButton>

                <IonButton
                  expand="block"
                  fill="outline"
                  color="dark"
                  style={{ height: "48px", fontWeight: 600 }}
                  onClick={() => history.push("/consulta")}
                >
                  <IonIcon slot="start" icon={searchOutline} />
                  Consultar un reclamo
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Sección "Mis reclamos" */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <h3 style={{ fontWeight: 700, margin: 0 }}>Mis reclamos</h3>
            <IonBadge color="medium">{reclamos.length}</IonBadge>
          </div>

          {reclamos.length === 0 ? (
            <IonCard
              style={{
                borderRadius: "12px",
                textAlign: "center",
                padding: "20px",
              }}
            >
              <IonText color="medium">
                <p>No tienes reclamos registrados actualmente.</p>
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
                    marginBottom: "14px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <IonCardContent>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <strong style={{ fontSize: "1.1rem", color: "#111" }}>
                        #{r.folio}
                      </strong>
                      <IonBadge
                        color={r.estado === "Resuelto" ? "success" : "dark"}
                        style={{
                          fontSize: "11px",
                          padding: "4px 10px",
                          textTransform: "uppercase",
                        }}
                      >
                        {enProceso ? "EN PROCESO" : r.estado}
                      </IonBadge>
                    </div>

                    <h4
                      style={{
                        margin: "8px 0 4px 0",
                        fontWeight: 600,
                        color: "#333",
                      }}
                    >
                      {r.categoria}
                    </h4>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#666",
                        fontSize: "13px",
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
                        borderTop: "1px solid #f0f0f0",
                        fontSize: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          color: "#777",
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
                            color: vencido ? "red" : "#e65100",
                            fontWeight: 600,
                          }}
                        >
                          <IonIcon icon={timeOutline} />
                          <span>{diasRestantes} días restantes</span>
                        </div>
                      ) : (
                        <IonText color="success" style={{ fontWeight: 600 }}>
                          Completado
                        </IonText>
                      )}
                    </div>
                  </IonCardContent>
                </IonCard>
              );
            })
          )}
        </div>

        {/* MODAL: Ingresar un reclamo */}
        <IonModal
          isOpen={modalCrearAbierto}
          onDidDismiss={() => setModalCrearAbierto(false)}
        >
          <IonHeader>
            <IonToolbar color="light">
              <IonButtons slot="start">
                <IonButton onClick={() => setModalCrearAbierto(false)}>
                  <IonIcon icon={arrowBackOutline} />
                </IonButton>
              </IonButtons>
              <IonTitle style={{ fontWeight: 600 }}>
                Ingresar un reclamo
              </IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            <div style={{ maxWidth: "520px", margin: "0 auto" }}>
              {/* FORMULARIO DE INGRESO */}
              {!reclamoCreadoExito ? (
                <form onSubmit={handleEnviarReclamo}>
                  {/* Selector Categoría */}
                  <div style={{ marginBottom: "16px" }}>
                    <IonLabel
                      style={{
                        fontWeight: 600,
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      Seleccionar Categoría (*)
                    </IonLabel>
                    <IonItem
                      lines="none"
                      style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                    >
                      <IonSelect
                        value={categoria}
                        placeholder="Seleccionar Categoría..."
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

                  {/* Descripción con contador 0/500 */}
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <IonLabel style={{ fontWeight: 600 }}>
                        Descripción (*)
                      </IonLabel>
                      <small
                        style={{
                          color: descripcion.length >= 500 ? "red" : "#777",
                        }}
                      >
                        {descripcion.length}/500 caracteres
                      </small>
                    </div>
                    <IonItem
                      lines="none"
                      style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                    >
                      <IonTextarea
                        value={descripcion}
                        rows={5}
                        maxlength={500}
                        placeholder="Cuéntanos qué ocurrió..."
                        onIonInput={(e) => setDescripcion(e.detail.value!)}
                      />
                    </IonItem>
                  </div>

                  {/* Dirección */}
                  <div style={{ marginBottom: "16px" }}>
                    <IonLabel
                      style={{
                        fontWeight: 600,
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      Ingresa la dirección (*)
                    </IonLabel>
                    <IonItem
                      lines="none"
                      style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                    >
                      <IonInput
                        value={ubicacion}
                        placeholder="Ej: Av. Arturo Phillips 245, Santo Domingo"
                        onIonInput={(e) => setUbicacion(e.detail.value!)}
                      />
                    </IonItem>
                  </div>

                  {/* Adjuntar fotografía */}
                  <div style={{ marginBottom: "24px" }}>
                    <IonLabel
                      style={{
                        fontWeight: 600,
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      ADJUNTAR FOTOGRAFÍA
                    </IonLabel>
                    <small
                      style={{
                        color: "#777",
                        display: "block",
                        marginBottom: "10px",
                      }}
                    >
                      JPG o PNG - Máx. 5MB (Opcional)
                    </small>

                    <IonButton
                      expand="block"
                      fill="outline"
                      color="medium"
                      style={{ borderRadius: "8px" }}
                      onClick={() => setFotoSimulada(!fotoSimulada)}
                    >
                      <IonIcon
                        slot="start"
                        icon={fotoSimulada ? imageOutline : cameraOutline}
                      />
                      {fotoSimulada
                        ? "✓ Fotografía adjuntada (1 archivo)"
                        : "Adjuntar fotografía"}
                    </IonButton>
                  </div>

                  {/* Botón Enviar reclamo */}
                  <IonButton
                    expand="block"
                    type="submit"
                    color="dark"
                    style={{ height: "48px", fontWeight: 600 }}
                  >
                    Enviar reclamo
                  </IonButton>
                </form>
              ) : (
                /* Figma móvil - Fila 3 */
                <div
                  className="ion-text-center"
                  style={{ padding: "20px 10px" }}
                >
                  <IonIcon
                    icon={checkmarkCircle}
                    style={{
                      fontSize: "72px",
                      color: "var(--ion-color-dark, #222)",
                    }}
                  />

                  <h2 style={{ fontWeight: 700, margin: "16px 0 8px 0" }}>
                    ¡Reclamo ingresado correctamente!
                  </h2>

                  <IonCard
                    style={{
                      borderRadius: "16px",
                      margin: "24px 0",
                      border: "1px solid #e0e0e0",
                      boxShadow: "none",
                    }}
                  >
                    <IonCardContent style={{ padding: "20px" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Número de folio
                      </span>
                      <h1
                        style={{
                          fontWeight: 800,
                          fontSize: "2rem",
                          margin: "8px 0",
                          color: "#111",
                        }}
                      >
                        #{reclamoCreadoExito.folio}
                      </h1>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#777",
                          margin: "8px 0 16px 0",
                        }}
                      >
                        Guarda este número para realizar el seguimiento de tu
                        reclamo.
                      </p>
                      <div
                        style={{
                          borderTop: "1px solid #eee",
                          paddingTop: "12px",
                          fontSize: "13px",
                          color: "#555",
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
                    color="dark"
                    style={{ height: "48px", fontWeight: 600 }}
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
          duration={3000}
          onDidDismiss={() => setToastMsg("")}
        />
      </IonContent>
    </IonPage>
  );
};

export default VecinoHomePage;
