import React, { useState } from "react";
import { IonIcon, IonAlert } from "@ionic/react";
import {
  clipboardOutline,
  statsChartOutline,
  logOutOutline,
  personCircleOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from "ionicons/icons";
import { useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AdminSidebar: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { logout, user } = useAuth();

  const [colapsado, setColapsado] = useState(false);
  const [alertaSalirAbierta, setAlertaSalirAbierta] = useState(false);

  const esRutaActiva = (ruta: string) => location.pathname === ruta;

  return (
    <>
      <aside
        className="ion-hide-md-down"
        style={{
          width: colapsado ? "72px" : "260px",
          minWidth: colapsado ? "72px" : "260px",
          transition: "width 0.25s ease, min-width 0.25s ease",
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "100vh",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Cabecera del sidebar */}
        <div>
          <div
            style={{
              padding: colapsado ? "16px 8px" : "20px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: colapsado ? "center" : "space-between",
              gap: "8px",
            }}
          >
            {!colapsado && (
              <div style={{ textAlign: "left", overflow: "hidden" }}>
                <img
                  src="/logo-santodomingo.png"
                  alt="Santo Domingo"
                  style={{
                    maxHeight: "38px",
                    maxWidth: "120px",
                    objectFit: "contain",
                    display: "block",
                    marginBottom: "4px",
                  }}
                />
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#0D3B66",
                    letterSpacing: "0.6px",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Portal Funcionario OIRS
                </span>
              </div>
            )}

            {/* Boton para colapsar */}
            <button
              type="button"
              onClick={() => setColapsado(!colapsado)}
              title={
                colapsado ? "Expandir panel lateral" : "Ocultar panel lateral"
              }
              style={{
                background: "#F1F5F9",
                border: "1px solid #CBD5E1",
                borderRadius: "8px",
                width: "32px",
                height: "32px",
                minWidth: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#0D3B66",
              }}
            >
              <IonIcon
                icon={colapsado ? chevronForwardOutline : chevronBackOutline}
                style={{ fontSize: "18px" }}
              />
            </button>
          </div>

          <div
            style={{
              height: "4px",
              width: "100%",
              background:
                "linear-gradient(90deg, #0D3B66 0%, #2E7D32 50%, #F59E0B 100%)",
            }}
          />

          {/* Enlaces de navegacion */}
          <nav
            style={{
              padding: "20px 10px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <button
              type="button"
              onClick={() => history.push("/admin/inicio")}
              title="Reclamos OIRS"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: colapsado ? "center" : "flex-start",
                gap: colapsado ? "0" : "12px",
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "none",
                background: esRutaActiva("/admin/inicio")
                  ? "#0D3B66"
                  : "transparent",
                color: esRutaActiva("/admin/inicio") ? "#FFFFFF" : "#475569",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              <IonIcon
                icon={clipboardOutline}
                style={{ fontSize: "20px", minWidth: "20px" }}
              />
              {!colapsado && (
                <span style={{ whiteSpace: "nowrap" }}>Reclamos OIRS</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => history.push("/admin/dashboard")}
              title="Métricas de Gestión"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: colapsado ? "center" : "flex-start",
                gap: colapsado ? "0" : "12px",
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "none",
                background: esRutaActiva("/admin/dashboard")
                  ? "#0D3B66"
                  : "transparent",
                color: esRutaActiva("/admin/dashboard") ? "#FFFFFF" : "#475569",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              <IonIcon
                icon={statsChartOutline}
                style={{ fontSize: "20px", minWidth: "20px" }}
              />
              {!colapsado && (
                <span style={{ whiteSpace: "nowrap" }}>
                  Métricas de Gestión
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Zona inferior con confirmacion de salida */}
        <div
          style={{
            padding: colapsado ? "12px 8px" : "16px",
            borderTop: "1px solid #F1F5F9",
            background: "#F8FAFC",
          }}
        >
          {!colapsado ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <IonIcon
                  icon={personCircleOutline}
                  style={{ fontSize: "32px", color: "#0D3B66" }}
                />
                <div style={{ overflow: "hidden" }}>
                  <strong
                    style={{
                      fontSize: "13px",
                      color: "#0F172A",
                      display: "block",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user?.nombre || "Funcionario"}
                  </strong>
                  <small style={{ color: "#64748B", fontSize: "11px" }}>
                    OIRS Municipal
                  </small>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAlertaSalirAbierta(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #FECACA",
                  background: "#FFFFFF",
                  color: "#DC2626",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                <IonIcon icon={logOutOutline} style={{ fontSize: "16px" }} />
                <span>Cerrar Sesión</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setAlertaSalirAbierta(true)}
              title="Cerrar Sesión"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: "10px 0",
                borderRadius: "8px",
                border: "1px solid #FECACA",
                background: "#FFFFFF",
                color: "#DC2626",
                cursor: "pointer",
              }}
            >
              <IonIcon icon={logOutOutline} style={{ fontSize: "18px" }} />
            </button>
          )}
        </div>
      </aside>

      {/* Alerta de confirmacion de salida */}
      <IonAlert
        isOpen={alertaSalirAbierta}
        onDidDismiss={() => setAlertaSalirAbierta(false)}
        header="¿Cerrar sesión?"
        message="¿Está seguro de que desea salir del portal de funcionario?"
        buttons={[
          { text: "Cancelar", role: "cancel" },
          { text: "Cerrar sesión", role: "destructive", handler: logout },
        ]}
      />
    </>
  );
};

export default AdminSidebar;
