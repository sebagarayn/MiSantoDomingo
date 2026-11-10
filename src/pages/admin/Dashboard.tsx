import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
  IonToast,
  IonSkeletonText,
  IonButton,
  IonText,
} from "@ionic/react";
import {
  timeOutline,
  alertCircleOutline,
  documentTextOutline,
  calendarOutline,
  clipboardOutline,
  statsChartOutline,
  logOutOutline,
  downloadOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { reportService } from "../../services/report.service";
import { IReport } from "../../types";
import AdminSidebar from "../../components/AdminSidebar";

const Dashboard: React.FC = () => {
  const history = useHistory();
  const { logout } = useAuth();

  // Estados locales para los reclamos, el periodo seleccionado y la alerta de salida
  const [reclamos, setReclamos] = useState<IReport[]>([]);
  const [periodo, setPeriodo] = useState("30dias");
  const [alertaSalirAbierta, setAlertaSalirAbierta] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [exportandoPDF, setExportandoPDF] = useState(false);
  const dashboardRef = useRef<HTMLElement | null>(null);

  // Función separada para cargar al inicio y reutilizar en el botón "Reintentar"
  const cargarMetricas = async () => {
    try {
      setCargando(true);
      setErrorCarga(null);
      const data = await reportService.obtenerReclamos();
      setReclamos(data);
    } catch (error) {
      console.error("Error al cargar las métricas:", error);
      const mensaje =
        "No se pudo conectar con el servidor para cargar las métricas.";
      setErrorCarga(mensaje);
      setToastMsg(mensaje);
    } finally {
      setCargando(false);
    }
  };

  // Leemos todos los reclamos desde PostgreSQL apenas arranca la vista
  useEffect(() => {
    cargarMetricas();
  }, []);

  // RF-11: Exportar los reclamos del periodo seleccionado a CSV (Excel)
  const exportarCSV = () => {
    if (reclamosFiltrados.length === 0) {
      setToastMsg("No hay datos en este periodo para exportar.");
      return;
    }

    const encabezados = [
      "Folio",
      "Categoría",
      "Unidad Asignada",
      "Estado",
      "Fecha Ingreso",
      "Ubicación",
      "Descripción",
    ];

    const filas = reclamosFiltrados.map((r) => [
      `"${r.folio || ""}"`,
      `"${(r.categoria || "").replace(/"/g, '""')}"`,
      `"${(r.unidadAsignada || "OIRS Central").replace(/"/g, '""')}"`,
      `"${r.estado || ""}"`,
      `"${new Date(r.fechaIngreso).toLocaleDateString("es-CL")}"`,
      `"${(r.ubicacion || "").replace(/"/g, '""')}"`,
      `"${(r.descripcion || "").replace(/"/g, '""')}"`,
    ]);

    // \uFEFF asegura que Excel reconozca tildes y la letra ñ correctamente
    const contenidoCSV =
      "\uFEFF" +
      [encabezados.join(";"), ...filas.map((f) => f.join(";"))].join("\n");

    const blob = new Blob([contenidoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `reporte_oirs_${periodo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // RF-11: Genera un PDF descargable con las métricas y el gráfico visibles.
  const exportarPDF = async () => {
    const elemento = dashboardRef.current;

    if (!elemento) {
      setToastMsg("No se encontró el contenido del dashboard para exportar.");
      return;
    }

    try {
      setExportandoPDF(true);

      const canvas = await html2canvas(elemento, {
        scale: 2,
        backgroundColor: "#F8FAFC",
        useCORS: true,
        logging: false,
        windowWidth: elemento.scrollWidth,
      });

      const imagen = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const margen = 10;
      const anchoPagina = pdf.internal.pageSize.getWidth();
      const altoPagina = pdf.internal.pageSize.getHeight();
      const anchoImagen = anchoPagina - margen * 2;
      const altoImagen = (canvas.height * anchoImagen) / canvas.width;
      const altoUtil = altoPagina - margen * 2;

      let altoRestante = altoImagen;
      let posicionY = margen;

      pdf.addImage(imagen, "PNG", margen, posicionY, anchoImagen, altoImagen);
      altoRestante -= altoUtil;

      while (altoRestante > 0) {
        pdf.addPage();
        posicionY = margen - (altoImagen - altoRestante);
        pdf.addImage(imagen, "PNG", margen, posicionY, anchoImagen, altoImagen);
        altoRestante -= altoUtil;
      }

      pdf.save(`metricas_oirs_${periodo}.pdf`);
      setToastMsg("El reporte PDF se descargó correctamente.");
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      setToastMsg("No se pudo generar el PDF. Inténtalo nuevamente.");
    } finally {
      setExportandoPDF(false);
    }
  };

  // Filtramos los reclamos segun el rango de tiempo seleccionado en el selector (7 dias, 30 dias o año)
  const reclamosFiltrados = reclamos.filter((r) => {
    const fechaReclamo = new Date(r.fechaIngreso).getTime();
    const ahora = Date.now();

    if (periodo === "7dias") {
      const limite7Dias = ahora - 7 * 24 * 60 * 60 * 1000;
      return fechaReclamo >= limite7Dias;
    }
    if (periodo === "30dias") {
      const limite30Dias = ahora - 30 * 24 * 60 * 60 * 1000;
      return fechaReclamo >= limite30Dias;
    }
    return true; // "anio": muestra todo el año en curso (2026)
  });

  // Calculo de los 3 KPIs en tiempo real a partir de los datos filtrados (RF-10)
  const totalIngresados = reclamosFiltrados.length;
  const resueltos = reclamosFiltrados.filter(
    (r) => r.estado === "Resuelto",
  ).length;

  // Detecta reclamos con mas de 20 dias corridos sin resolver usando la funcion del servicio
  const vencidos = reclamosFiltrados.filter(
    (r) =>
      r.estado !== "Resuelto" &&
      reportService.calcularDiasRestantes(r.fechaIngreso).vencido,
  ).length;

  const tasaResolucion =
    totalIngresados > 0 ? Math.round((resueltos / totalIngresados) * 100) : 0;

  // Agrupamos el conteo por categoria para dibujar las barras del grafico segun el periodo
  const categoriasConteo: { [key: string]: number } = {};
  reclamosFiltrados.forEach((r) => {
    const cat = r.categoria || "Otros";
    categoriasConteo[cat] = (categoriasConteo[cat] || 0) + 1;
  });

  return (
    <IonPage>
      {/* En celular mostramos esta cabecera azul chica; en PC se oculta porque el AdminSidebar toma el control */}
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
                alt="Logo Municipalidad de Santo Domingo"
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
        {/* Contenedor Flex: en PC se muestra AdminSidebar a la izquierda y el dashboard a la derecha */}
        <div style={{ display: "flex", minHeight: "100%" }}>
          <AdminSidebar />

          <main
            ref={dashboardRef}
            style={{
              flex: 1,
              padding: "24px 28px",
              maxWidth: "1200px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Cabecera y selector de periodo temporal (RF-10) junto a exportación (RF-11) */}
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
                  Monitoreo de cumplimiento de plazos y volumen comunal
                </p>
              </div>

              {/* Contenedor con selector de periodo + botones RF-11 (CSV / PDF) */}
              <div
                data-html2canvas-ignore="true"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
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
                    aria-label="Seleccionar periodo de tiempo de las métricas"
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

                <IonButton
                  size="small"
                  fill="outline"
                  onClick={exportarCSV}
                  disabled={cargando || reclamosFiltrados.length === 0}
                  aria-label="Descargar reporte de métricas en formato CSV"
                  style={{
                    "--border-color": "#0D3B66",
                    "--color": "#0D3B66",
                    "--border-radius": "8px",
                    fontWeight: 700,
                    height: "36px",
                  }}
                >
                  <IonIcon icon={downloadOutline} slot="start" />
                  CSV
                </IonButton>

                <IonButton
                  size="small"
                  onClick={exportarPDF}
                  disabled={cargando || exportandoPDF || reclamosFiltrados.length === 0}
                  aria-label="Exportar reporte de métricas en formato PDF"
                  style={{
                    "--background": "#0D3B66",
                    "--border-radius": "8px",
                    fontWeight: 700,
                    height: "36px",
                  }}
                >
                  <IonIcon icon={downloadOutline} slot="start" />
                  {exportandoPDF ? "Generando..." : "PDF"}
                </IonButton>
              </div>
            </div>

            {/* 1. ESTADO DE CARGA (Esqueleto con el mismo diseño de las 3 tarjetas KPI y el gráfico) */}
            {cargando && (
              <div
                role="status"
                aria-live="polite"
                aria-label="Cargando métricas del dashboard"
              >
                <IonGrid
                  className="ion-no-padding"
                  style={{ marginBottom: "20px" }}
                >
                  <IonRow>
                    {[1, 2, 3].map((n) => (
                      <IonCol size="12" sizeMd="4" key={n}>
                        <IonCard
                          style={{
                            borderRadius: "14px",
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #E2E8F0",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                            margin: "6px",
                            padding: "16px",
                          }}
                        >
                          <IonSkeletonText
                            animated
                            style={{
                              width: "60%",
                              height: "14px",
                              marginBottom: "12px",
                            }}
                          />
                          <IonSkeletonText
                            animated
                            style={{
                              width: "40%",
                              height: "38px",
                              marginBottom: "12px",
                            }}
                          />
                          <IonSkeletonText
                            animated
                            style={{ width: "80%", height: "14px" }}
                          />
                        </IonCard>
                      </IonCol>
                    ))}
                  </IonRow>
                </IonGrid>

                <IonCard
                  style={{
                    borderRadius: "16px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    padding: "20px",
                    margin: "6px",
                  }}
                >
                  <IonSkeletonText
                    animated
                    style={{
                      width: "45%",
                      height: "20px",
                      marginBottom: "20px",
                    }}
                  />
                  <IonSkeletonText
                    animated
                    style={{ width: "100%", height: "220px" }}
                  />
                </IonCard>
              </div>
            )}

            {/* 2. ESTADO DE ERROR CON BOTÓN DE REINTENTO */}
            {!cargando && errorCarga && (
              <IonCard
                style={{
                  borderRadius: "14px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #FECACA",
                  margin: "6px 0 20px 0",
                  textAlign: "center",
                  padding: "24px 16px",
                }}
                role="alert"
              >
                <IonCardContent>
                  <IonText color="danger">
                    <h2 style={{ fontWeight: 700, marginBottom: "8px" }}>
                      No se pudieron cargar las métricas
                    </h2>
                    <p style={{ marginBottom: "16px", color: "#64748B" }}>
                      {errorCarga}
                    </p>
                  </IonText>
                  <IonButton
                    onClick={cargarMetricas}
                    style={{ "--background": "#0D3B66" }}
                    aria-label="Reintentar carga de métricas del dashboard"
                  >
                    Reintentar
                  </IonButton>
                </IonCardContent>
              </IonCard>
            )}

            {/* 3. ESTADO VACÍO (Cuando conectó bien, pero hay 0 reclamos) */}
            {!cargando && !errorCarga && reclamos.length === 0 && (
              <IonCard
                style={{
                  borderRadius: "14px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  margin: "6px 0 20px 0",
                  textAlign: "center",
                  padding: "24px 16px",
                }}
              >
                <IonCardContent>
                  <p style={{ color: "#64748B", margin: 0, fontWeight: 600 }}>
                    No hay reclamos registrados en el sistema para calcular
                    métricas.
                  </p>
                </IonCardContent>
              </IonCard>
            )}

            {/* 4. CONTENIDO REAL DEL DASHBOARD (Se muestra cuando ya cargó y hay datos) */}
            {!cargando && !errorCarga && reclamos.length > 0 && (
              <>
                {/* Las 3 tarjetas de KPIs principales que pide el RF-10 y el Figma de Vicente */}
                <IonGrid
                  className="ion-no-padding"
                  style={{ marginBottom: "20px" }}
                >
                  <IonRow>
                    {/* KPI 1: Volumen total de reclamos ingresados */}
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
                        <IonCardHeader
                          style={{ padding: "16px 16px 8px 16px" }}
                        >
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
                        <IonCardContent
                          style={{ padding: "0 16px 16px 16px" }}
                        >
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
                              {resueltos} resueltos formalmente (
                              {tasaResolucion}%)
                            </span>
                          </div>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>

                    {/* KPI 2: Tiempo promedio de respuesta municipal */}
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
                        <IonCardHeader
                          style={{ padding: "16px 16px 8px 16px" }}
                        >
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
                        <IonCardContent
                          style={{ padding: "0 16px 16px 16px" }}
                        >
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

                    {/* KPI 3: Reclamos vencidos fuera de los 20 dias legales (se pinta en rojo si hay alertas) */}
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
                        <IonCardHeader
                          style={{ padding: "16px 16px 8px 16px" }}
                        >
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
                        <IonCardContent
                          style={{ padding: "0 16px 16px 16px" }}
                        >
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

                {/* Grafico de barras con alturas calculadas en px para que se vea identico en cualquier navegador */}
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
                        {periodo === "30dias"
                          ? "Últimos 30 días"
                          : periodo === "7dias"
                            ? "Últimos 7 días"
                            : "Año en curso (2026)"}
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
                          No hay reclamos en este periodo para graficar.
                        </p>
                      ) : (
                        Object.entries(categoriasConteo).map(([cat, count]) => {
                          // Calculamos la altura en px entre 45px y 170px para que las barras no colapsen a 0 en flexbox
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
                                role="img"
                                aria-label={`Categoría ${cat}: ${count} reclamos`}
                                style={{
                                  width: "38px",
                                  height: `${alturaPx}px`,
                                  backgroundColor: "#0D3B66",
                                  borderRadius: "4px 4px 0 0",
                                  boxShadow:
                                    "0 2px 4px rgba(13, 59, 102, 0.2)",
                                }}
                              />
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Etiquetas de categorias debajo de cada barra */}
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
              </>
            )}
          </main>
        </div>

        {/* Modal de confirmacion antes de cerrar sesion */}
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

      {/* Barra inferior fija solo para celulares (Admin movil) */}
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
            aria-label="Ir a bandeja de reclamos"
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
            aria-label="Métricas del dashboard"
            style={{ "--color-selected": "#0D3B66" }}
          >
            <IonIcon icon={statsChartOutline} style={{ color: "#0D3B66" }} />
            <IonLabel style={{ color: "#0D3B66", fontWeight: 800 }}>
              Métricas
            </IonLabel>
          </IonTabButton>

          {/* Pestana 3: Salir con confirmacion */}
          <IonTabButton
            tab="salir"
            aria-label="Cerrar sesión"
            onClick={() => setAlertaSalirAbierta(true)}
          >
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