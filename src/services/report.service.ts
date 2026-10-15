import {
  IReport,
  ICreateReportInput,
  IUpdateReportStatusInput,
  IRatingInput,
  IStatusHistory,
} from "../types";

const API_BASE = "http://localhost:3000/api";

// Mapas para traducir nombres de categorias y unidades a IDs de la base de datos
const MAPA_CATEGORIAS: Record<string, number> = {
  "alumbrado público": 1,
  "alumbrado publico": 1,
  "aseo y ornato": 2,
  "calles y veredas": 3,
  "seguridad ciudadana": 4,
  "transporte y tránsito": 5,
  "transporte y transito": 5,
  otros: 6,
};

const MAPA_UNIDADES: Record<string, number> = {
  "oirs central": 1,
  "obras municipales": 2,
  salud: 3,
  educación: 4,
  educacion: 4,
  "desarrollo comunitario": 5,
};

// Convierte el registro de PostgreSQL al formato IReport que espera tu interfaz
const mapearDesdeDB = (r: any): IReport => {
  // Obtenemos el id del usuario que tiene la sesion abierta actualmente
  const sesionStr = localStorage.getItem("msd_session_user");
  const usuarioActual = sesionStr ? JSON.parse(sesionStr) : null;
  const idCreador = r.id_usuario
    ? `usr-${r.id_usuario}`
    : usuarioActual
      ? usuarioActual.id
      : "usr-vecino-1";

  return {
    folio: r.folio,
    categoria: r.categoria,
    descripcion: r.descripcion,
    ubicacion: r.ubicacion,
    fotoUrl: r.foto_url
      ? r.foto_url.startsWith("http")
        ? r.foto_url
        : `http://localhost:3000${r.foto_url}`
      : undefined,
    estado: r.estado,
    fechaIngreso: r.fecha_ingreso,
    unidadAsignada: r.unidad_asignada,
    origen: "usuario",
    creadorId: idCreador,
    respuestaFormal: r.respuesta_formal || undefined,
    calificacion: r.calificacion ? r.calificacion.puntaje : undefined,
    historial:
      r.historial && r.historial.length > 0
        ? r.historial.map(
            (h: any): IStatusHistory => ({
              estado: h.estado,
              fecha: h.fecha,
              observacion: h.observacion || undefined,
              responsableId:
                h.nombre_responsable || h.unidad_destino || undefined,
            }),
          )
        : [
            {
              estado: r.estado,
              fecha: r.fecha_ingreso,
              observacion: "Reclamo registrado en el sistema municipal.",
            },
          ],
  };
};

class ReportService {
  // Helper para hacer llamadas con token Bearer
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("msd_token");
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  // Calculo oficial de los 20 dias legales (RF-04)
  public calcularDiasRestantes(fechaIngresoStr: string): {
    diasRestantes: number;
    vencido: boolean;
  } {
    const fechaIngreso = new Date(fechaIngresoStr);
    const fechaLimite = new Date(
      fechaIngreso.getTime() + 20 * 24 * 60 * 60 * 1000,
    );
    const hoy = new Date();
    const diferenciaMs = fechaLimite.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
    return {
      diasRestantes: diasRestantes < 0 ? 0 : diasRestantes,
      vencido: diasRestantes <= 0,
    };
  }

  // 1. Obtener listado de reclamos desde la API
  public async obtenerReclamos(): Promise<IReport[]> {
    try {
      const res = await fetch(`${API_BASE}/reclamos`, {
        headers: this.getHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        return data.reclamos.map(mapearDesdeDB);
      }
    } catch (error) {
      console.error("Error al obtener reclamos desde el backend:", error);
    }
    return [];
  }

  // 2. Consulta publica por folio sin inicio de sesion (RF-03)
  public async obtenerReclamoPorFolio(folio: string): Promise<IReport | null> {
    try {
      const res = await fetch(
        `${API_BASE}/reclamos/folio/${encodeURIComponent(folio.trim())}`,
      );
      const data = await res.json();
      if (res.ok && data.ok) {
        const reclamo = mapearDesdeDB(data.reclamo);
        if (data.historial) {
          reclamo.historial = data.historial.map(
            (h: any): IStatusHistory => ({
              estado: h.estado,
              fecha: h.fecha,
              observacion: h.observacion || undefined,
              responsableId: h.unidad_destino || undefined,
            }),
          );
        }
        if (data.calificacion) {
          reclamo.calificacion = data.calificacion.puntaje;
        }
        return reclamo;
      }
    } catch (error) {
      console.error("Error al consultar folio en backend:", error);
    }
    return null;
  }

  // 3. Crear nuevo reclamo (RF-01 y RF-02)
  public async crearReclamo(
    input: ICreateReportInput,
    _creadorId?: string,
  ): Promise<IReport> {
    const catNormalizada = input.categoria.toLowerCase().trim();
    const id_categoria = MAPA_CATEGORIAS[catNormalizada] || 6; // 6 = 'Otros'

    const res = await fetch(`${API_BASE}/reclamos`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        id_categoria,
        descripcion: input.descripcion,
        ubicacion: input.ubicacion,
      }),
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      return mapearDesdeDB(data.reclamo);
    }
    throw new Error(data.mensaje || "Error al crear el reclamo en el servidor");
  }

  // 4. Derivar o cerrar reclamo (RF-07 y RF-08)
  public async actualizarEstado(
    folio: string,
    input: IUpdateReportStatusInput,
    respuestaFormal?: string,
  ): Promise<IReport> {
    // 1. Buscamos el id del reclamo por su folio
    const resFolio = await fetch(
      `${API_BASE}/reclamos/folio/${encodeURIComponent(folio.trim())}`,
    );
    const dataFolio = await resFolio.json();
    if (!resFolio.ok || !dataFolio.ok) throw new Error("Reclamo no encontrado");

    const id_reclamo = dataFolio.reclamo.id_reclamo;

    // 2. Si deriva, obtenemos el id de la unidad destino
    let id_unidad_destino: number | undefined;
    if (input.unidadAsignada) {
      const uNormalizada = input.unidadAsignada.toLowerCase().trim();
      id_unidad_destino = MAPA_UNIDADES[uNormalizada] || 2;
    }

    const resPatch = await fetch(`${API_BASE}/reclamos/${id_reclamo}/estado`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({
        nuevo_estado: input.estado,
        id_unidad_destino,
        observacion:
          input.observacion || `Actualizado a estado ${input.estado}`,
        respuesta_formal: respuestaFormal,
      }),
    });

    const dataPatch = await resPatch.json();
    if (!resPatch.ok) {
      throw new Error(dataPatch.mensaje || "Error al actualizar el estado");
    }

    // Retornamos el reclamo fresco
    const reclamoActualizado = await this.obtenerReclamoPorFolio(folio);
    return reclamoActualizado!;
  }

  // 5. Calificacion ciudadana de 1 a 5 estrellas (RF-09)
  public async calificarRespuesta(
    folio: string,
    rating: IRatingInput,
  ): Promise<IReport> {
    const resFolio = await fetch(
      `${API_BASE}/reclamos/folio/${encodeURIComponent(folio.trim())}`,
    );
    const dataFolio = await resFolio.json();
    if (!resFolio.ok || !dataFolio.ok) throw new Error("Reclamo no encontrado");

    const id_reclamo = dataFolio.reclamo.id_reclamo;

    const resCalif = await fetch(
      `${API_BASE}/reclamos/${id_reclamo}/calificacion`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          puntaje: rating.calificacion,
        }),
      },
    );

    const dataCalif = await resCalif.json();
    if (!resCalif.ok) {
      throw new Error(
        dataCalif.mensaje || "Error al registrar la calificación",
      );
    }

    const reclamoActualizado = await this.obtenerReclamoPorFolio(folio);
    return reclamoActualizado!;
  }
}

export const reportService = new ReportService();
