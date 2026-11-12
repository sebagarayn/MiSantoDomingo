import React, { useState, useEffect, useCallback } from "react";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonCard, IonList, IonItem, IonLabel, IonInput, IonModal, IonSegment,
  IonSegmentButton, IonAlert, IonToast, IonSpinner, IonFooter, IonTabBar, IonTabButton,
} from "@ionic/react";
import {
  addOutline, createOutline, trashOutline, lockClosedOutline, clipboardOutline,
  statsChartOutline, listOutline, logOutOutline, closeOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { catalogosService } from "../../services/catalogos.service";
import AdminSidebar from "../../components/AdminSidebar";

type Catalogo = "categorias" | "unidades";

// Un elemento de cualquiera de los dos catalogos, con el id ya normalizado
interface Elemento {
  id: number;
  nombre: string;
}

// Todo reclamo nuevo entra a esta unidad: el backend no permite eliminarla ni renombrarla
const UNIDAD_DE_INGRESO = "OIRS Central";

// Textos que cambian segun el catalogo que se esta editando
const TEXTOS: Record<
  Catalogo,
  { titulo: string; singular: string; nueva: string; vacio: string }
> = {
  categorias: {
    titulo: "Categorías",
    singular: "categoría",
    nueva: "Nueva categoría",
    vacio: "Todavía no hay categorías.",
  },
  unidades: {
    titulo: "Unidades municipales",
    singular: "unidad",
    nueva: "Nueva unidad",
    vacio: "Todavía no hay unidades.",
  },
};

// Misma regla que valida el servidor (el servidor igual la vuelve a comprobar)
const validarNombre = (texto: string): string => {
  const nombre = texto.trim();
  if (nombre.length < 1) return "Escribe un nombre.";
  if (nombre.length > 100) return "El nombre no puede superar los 100 caracteres.";
  return "";
};

const mensajeDeError = (error: unknown): string =>
  error instanceof Error ? error.message : "Ocurrió un error inesperado.";

const CatalogosPage: React.FC = () => {
  const history = useHistory();
  const { logout } = useAuth();

  const [catalogo, setCatalogo] = useState<Catalogo>("categorias");
  const [categorias, setCategorias] = useState<Elemento[]>([]);
  const [unidades, setUnidades] = useState<Elemento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  // Modal de crear / editar. "editando" es null cuando se esta creando
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Elemento | null>(null);
  const [nombreForm, setNombreForm] = useState("");
  const [errorForm, setErrorForm] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Confirmacion antes de eliminar, aviso de resultado y confirmacion de salida
  const [porEliminar, setPorEliminar] = useState<Elemento | null>(null);
  const [toast, setToast] = useState<{ texto: string; color: string } | null>(null);
  const [alertaSalirAbierta, setAlertaSalirAbierta] = useState(false);

  const textos = TEXTOS[catalogo];
  const lista = catalogo === "categorias" ? categorias : unidades;

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [cats, unis] = await Promise.all([
        catalogosService.obtenerCategorias(),
        catalogosService.obtenerUnidades(),
      ]);
      setCategorias(cats.map((c) => ({ id: c.id_categoria, nombre: c.nombre })));
      setUnidades(unis.map((u) => ({ id: u.id_unidad, nombre: u.nombre })));
      setErrorCarga("");
    } catch (error) {
      setErrorCarga(mensajeDeError(error));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const abrirCrear = () => {
    setEditando(null);
    setNombreForm("");
    setErrorForm("");
    setModalAbierto(true);
  };

  const abrirEditar = (elemento: Elemento) => {
    setEditando(elemento);
    setNombreForm(elemento.nombre);
    setErrorForm("");
    setModalAbierto(true);
  };

  const guardar = async () => {
    const problema = validarNombre(nombreForm);
    if (problema) {
      setErrorForm(problema);
      return;
    }
    const nombre = nombreForm.trim();

    setGuardando(true);
    try {
      if (catalogo === "categorias") {
        if (editando) await catalogosService.actualizarCategoria(editando.id, nombre);
        else await catalogosService.crearCategoria(nombre);
      } else {
        if (editando) await catalogosService.actualizarUnidad(editando.id, nombre);
        else await catalogosService.crearUnidad(nombre);
      }
      setModalAbierto(false);
      setToast({
        texto: editando
          ? `Cambios guardados en la ${textos.singular}.`
          : `${textos.singular.charAt(0).toUpperCase()}${textos.singular.slice(1)} creada.`,
        color: "success",
      });
      await cargar();
    } catch (error) {
      // Aqui llegan los 400 y 409 del servidor (por ejemplo, nombre repetido)
      setErrorForm(mensajeDeError(error));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (elemento: Elemento) => {
    try {
      if (catalogo === "categorias") await catalogosService.eliminarCategoria(elemento.id);
      else await catalogosService.eliminarUnidad(elemento.id);
      setToast({ texto: `Se eliminó "${elemento.nombre}".`, color: "success" });
      await cargar();
    } catch (error) {
      // Un 409 llega aqui con el motivo: hay reclamos que usan el registro
      setToast({ texto: mensajeDeError(error), color: "danger" });
    }
  };

  return (
    <IonPage>
      {/* En celular mostramos esta cabecera azul; en PC se oculta porque la barra lateral toma el control */}
      <IonHeader className="ion-no-border ion-hide-md-up">
        <IonToolbar style={{ "--background": "#0D3B66", padding: "4px 0" }}>
          <IonTitle
            style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF", textTransform: "uppercase" }}
          >
            Catálogos
          </IonTitle>
        </IonToolbar>
        <div
          style={{
            height: "3px",
            width: "100%",
            background: "linear-gradient(90deg, #0D3B66 0%, #2E7D32 50%, #F59E0B 100%)",
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
              maxWidth: "800px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div>
                <h1 style={{ fontWeight: 800, color: "#0D3B66", margin: "0 0 2px 0", fontSize: "1.5rem" }}>
                  Catálogos
                </h1>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748B" }}>
                  Categorías de reclamo y unidades municipales
                </p>
              </div>
              <IonButton onClick={abrirCrear} style={{ "--background": "#0D3B66", fontWeight: 700 }}>
                <IonIcon slot="start" icon={addOutline} />
                {textos.nueva}
              </IonButton>
            </div>

            <IonSegment
              value={catalogo}
              onIonChange={(e) => setCatalogo(e.detail.value as Catalogo)}
              aria-label="Elegir catálogo"
              style={{ marginBottom: "16px" }}
            >
              <IonSegmentButton value="categorias">
                <IonLabel>Categorías</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="unidades">
                <IonLabel>Unidades</IonLabel>
              </IonSegmentButton>
            </IonSegment>

            <IonCard
              style={{
                margin: 0,
                borderRadius: "16px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "none",
              }}
            >
              {cargando ? (
                <div
                  role="status"
                  aria-label="Cargando"
                  style={{ display: "flex", justifyContent: "center", padding: "32px" }}
                >
                  <IonSpinner name="crescent" color="primary" />
                </div>
              ) : errorCarga ? (
                <div style={{ padding: "24px", textAlign: "center" }}>
                  <p style={{ color: "#DC2626", fontWeight: 600 }}>{errorCarga}</p>
                  <IonButton fill="outline" onClick={cargar}>
                    Reintentar
                  </IonButton>
                </div>
              ) : lista.length === 0 ? (
                <p style={{ padding: "24px", textAlign: "center", color: "#64748B" }}>
                  {textos.vacio}
                </p>
              ) : (
                <IonList lines="full" aria-label={textos.titulo}>
                  {lista.map((elemento) => {
                    const protegida =
                      catalogo === "unidades" && elemento.nombre === UNIDAD_DE_INGRESO;
                    return (
                      <IonItem key={elemento.id}>
                        <IonLabel>
                          <h2 style={{ fontWeight: 600, color: "#0F172A" }}>{elemento.nombre}</h2>
                          {protegida && (
                            <p style={{ fontSize: "12px", color: "#64748B" }}>
                              Recibe todos los reclamos nuevos: no se puede renombrar ni eliminar.
                            </p>
                          )}
                        </IonLabel>
                        {protegida ? (
                          <IonIcon
                            slot="end"
                            icon={lockClosedOutline}
                            aria-label="Unidad protegida"
                            style={{ color: "#94A3B8" }}
                          />
                        ) : (
                          <IonButtons slot="end">
                            <IonButton
                              aria-label={`Editar ${elemento.nombre}`}
                              onClick={() => abrirEditar(elemento)}
                            >
                              <IonIcon slot="icon-only" icon={createOutline} />
                            </IonButton>
                            <IonButton
                              color="danger"
                              aria-label={`Eliminar ${elemento.nombre}`}
                              onClick={() => setPorEliminar(elemento)}
                            >
                              <IonIcon slot="icon-only" icon={trashOutline} />
                            </IonButton>
                          </IonButtons>
                        )}
                      </IonItem>
                    );
                  })}
                </IonList>
              )}
            </IonCard>
          </main>
        </div>

        {/* Modal para crear o editar */}
        <IonModal isOpen={modalAbierto} onDidDismiss={() => setModalAbierto(false)}>
          <IonHeader className="ion-no-border">
            <IonToolbar style={{ "--background": "#0D3B66" }}>
              <IonTitle style={{ color: "#FFFFFF", fontSize: "15px", fontWeight: 700 }}>
                {editando ? `Editar ${textos.singular}` : textos.nueva}
              </IonTitle>
              <IonButtons slot="end">
                <IonButton
                  aria-label="Cerrar"
                  onClick={() => setModalAbierto(false)}
                  style={{ "--color": "#FFFFFF" }}
                >
                  <IonIcon slot="icon-only" icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonInput
              label="Nombre"
              labelPlacement="stacked"
              fill="outline"
              placeholder={`Nombre de la ${textos.singular}`}
              value={nombreForm}
              maxlength={100}
              counter
              errorText={errorForm}
              className={errorForm ? "ion-invalid ion-touched" : ""}
              onIonInput={(e) => {
                setNombreForm(e.detail.value ?? "");
                setErrorForm("");
              }}
            />
            <IonButton
              expand="block"
              disabled={guardando}
              onClick={guardar}
              style={{ marginTop: "20px", "--background": "#0D3B66", fontWeight: 700 }}
            >
              {guardando ? <IonSpinner name="crescent" /> : "Guardar"}
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Confirmacion antes de eliminar */}
        <IonAlert
          isOpen={porEliminar !== null}
          onDidDismiss={() => setPorEliminar(null)}
          header={`¿Eliminar ${textos.singular}?`}
          message={
            porEliminar
              ? `Se eliminará "${porEliminar.nombre}". Si hay reclamos que la usan, el sistema no lo permitirá.`
              : ""
          }
          buttons={[
            { text: "Cancelar", role: "cancel" },
            {
              text: "Eliminar",
              role: "destructive",
              handler: () => {
                if (porEliminar) eliminar(porEliminar);
              },
            },
          ]}
        />

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
          isOpen={toast !== null}
          message={toast?.texto ?? ""}
          color={toast?.color}
          duration={3500}
          onDidDismiss={() => setToast(null)}
        />
      </IonContent>

      {/* Barra inferior fija solo en celular */}
      <IonFooter className="ion-hide-md-up">
        <IonTabBar
          slot="bottom"
          style={{ borderTop: "1px solid #E2E8F0", height: "60px", "--background": "#FFFFFF" }}
        >
          <IonTabButton
            tab="reclamos"
            aria-label="Ir a bandeja de reclamos"
            onClick={() => history.push("/admin/inicio")}
          >
            <IonIcon icon={clipboardOutline} style={{ color: "#64748B" }} />
            <IonLabel style={{ color: "#64748B", fontWeight: 500 }}>Reclamos</IonLabel>
          </IonTabButton>
          <IonTabButton
            tab="metricas"
            aria-label="Métricas del dashboard"
            onClick={() => history.push("/admin/dashboard")}
          >
            <IonIcon icon={statsChartOutline} style={{ color: "#64748B" }} />
            <IonLabel style={{ color: "#64748B", fontWeight: 500 }}>Métricas</IonLabel>
          </IonTabButton>
          <IonTabButton tab="catalogos" style={{ "--color-selected": "#0D3B66" }}>
            <IonIcon icon={listOutline} style={{ color: "#0D3B66" }} />
            <IonLabel style={{ color: "#0D3B66", fontWeight: 800 }}>Catálogos</IonLabel>
          </IonTabButton>
          <IonTabButton
            tab="salir"
            aria-label="Cerrar sesión"
            onClick={() => setAlertaSalirAbierta(true)}
          >
            <IonIcon icon={logOutOutline} style={{ color: "#64748B" }} />
            <IonLabel style={{ color: "#64748B", fontWeight: 500 }}>Salir</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonFooter>
    </IonPage>
  );
};

export default CatalogosPage;