import {
  IReport,
  ICreateReportInput,
  IUpdateReportStatusInput,
  IRatingInput,
  IStatusHistory,
} from "../types";
import { apiFetch, API_URL } from "./api";

// Raiz del servidor (sin /api), para armar las URLs de las fotos
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

// Mapas para traducir nombres de categorias y unidades a IDs de la base de datos
const MAPA_CATEGORIAS: Record<string, number> = {
  "alumbrado público": 1,
  "alumbrado publico": 1,
  "aseo y ornato": 2,
  "calles y veredas": 3,
  "seguridad ciudadana": 4,
  seguridad: 4,
  "transporte y tránsito": 5,
  "transporte y transito": 5,
  transporte: 5,
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
  // El creador viene de la base de datos, no de la sesion
  const idCreador = r.id_usuario ? `usr-${r.id_usuario}` : undefined;

  return {
    folio: r.folio,
    categoria: r.categoria,
    descripcion: r.descripcion,
    ubicacion: r.ubicacion,
    fotoUrl: r.foto_url
      ? r.foto_url.startsWith("http")
        ? r.foto_url
        : `${SERVER_URL}${r.foto_url}`
      : undefined,
    estado: r.estado,
    fechaIngreso: r.fecha_ingreso,
    unidadAsignada: r.unidad_asignada,
    origen: "usuario",
    creadorId: idCreador,
    respuestaFormal: r.respuesta_formal || undefined,
    calificacion: r.calificacion
      ? typeof r.calificacion === "object"
        ? r.calificacion.puntaje
        : r.calificacion
      : undefined,
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
  // Busca el id interno del reclamo a partir de su folio
  // (apiFetch lanza el error del backend si el folio no existe)
  private async obtenerIdPorFolio(folio: string): Promise<number> {
    const data = await apiFetch(
      `/reclamos/folio/${encodeURIComponent(folio.trim())}`,
    );
    return data.reclamo.id_reclamo;
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
      const data = await apiFetch("/reclamos");
      return data.reclamos.map(mapearDesdeDB);
    } catch (error) {
      console.error("Error al obtener reclamos desde el backend:", error);
      return [];
    }
  }

  // 2. Consulta publica por folio sin inicio de sesion (RF-03)
  public async obtenerReclamoPorFolio(folio: string): Promise<IReport | null> {
    try {
      const data = await apiFetch(
        `/reclamos/folio/${encodeURIComponent(folio.trim())}`,
      );
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
    } catch (error) {
      console.error("Error al consultar folio en backend:", error);
      return null;
    }
  }

  // 3. Crear nuevo reclamo (RF-01 y RF-02)
  public async crearReclamo(
    input: ICreateReportInput,
    _creadorId?: string,
  ): Promise<IReport> {
    const catNormalizada = input.categoria.toLowerCase().trim();
    const id_categoria = MAPA_CATEGORIAS[catNormalizada] || 6; // 6 = 'Otros'

    const data = await apiFetch("/reclamos", {
      method: "POST",
      body: JSON.stringify({
        id_categoria,
        descripcion: input.descripcion,
        ubicacion: input.ubicacion,
      }),
    });

    return mapearDesdeDB(data.reclamo);
  }

  // 4. Derivar o cerrar reclamo (RF-07 y RF-08)
  public async actualizarEstado(
    folio: string,
    input: IUpdateReportStatusInput,
    respuestaFormal?: string,
  ): Promise<IReport> {
    // 1. Buscamos el id del reclamo por su folio
    const id_reclamo = await this.obtenerIdPorFolio(folio);

    // 2. Si deriva, obtenemos el id de la unidad destino
    let id_unidad_destino: number | undefined;
    if (input.unidadAsignada) {
      const uNormalizada = input.unidadAsignada.toLowerCase().trim();
      id_unidad_destino = MAPA_UNIDADES[uNormalizada] || 2;
    }

    // 3. Enviamos el cambio de estado (solo admin)
    await apiFetch(`/reclamos/${id_reclamo}/estado`, {
      method: "PATCH",
      body: JSON.stringify({
        nuevo_estado: input.estado,
        id_unidad_destino,
        observacion:
          input.observacion || `Actualizado a estado ${input.estado}`,
        respuesta_formal: respuestaFormal,
      }),
    });

    // Retornamos el reclamo fresco
    const reclamoActualizado = await this.obtenerReclamoPorFolio(folio);
    return reclamoActualizado!;
  }

  // 5. Calificacion ciudadana de 1 a 5 estrellas (RF-09)
  public async calificarRespuesta(
    folio: string,
    rating: IRatingInput | any,
  ): Promise<IReport> {
    const id_reclamo = await this.obtenerIdPorFolio(folio);

    // Detectamos si viene como .calificacion, .puntaje o el numero suelto
    const valorPuntaje =
      typeof rating === "object"
        ? rating.calificacion || rating.puntaje || 5
        : rating;

    await apiFetch(`/reclamos/${id_reclamo}/calificacion`, {
      method: "POST",
      body: JSON.stringify({ puntaje: valorPuntaje }),
    });

    // Refrescamos y retornamos el reclamo con su calificacion guardada
    const reclamoActualizado = await this.obtenerReclamoPorFolio(folio);
    return reclamoActualizado!;
  }

  // 6. Cancelar reclamo propio en estado Pendiente
  public async cancelarReclamo(folio: string): Promise<IReport> {
    const id_reclamo = await this.obtenerIdPorFolio(folio);

    await apiFetch(`/reclamos/${id_reclamo}`, { method: "DELETE" });

    return (await this.obtenerReclamoPorFolio(folio))!;
  }

  // 7. Editar antecedentes completos de un reclamo en estado Pendiente (Verbo PUT)
  public async editarReclamo(
    folio: string,
    datos: { categoria: string; descripcion: string; ubicacion: string },
  ): Promise<IReport> {
    const id_reclamo = await this.obtenerIdPorFolio(folio);
    const catNormalizada = datos.categoria.toLowerCase().trim();
    const id_categoria = MAPA_CATEGORIAS[catNormalizada] || 6;

    await apiFetch(`/reclamos/${id_reclamo}`, {
      method: "PUT",
      body: JSON.stringify({
        id_categoria,
        descripcion: datos.descripcion,
        ubicacion: datos.ubicacion,
      }),
    });

    return (await this.obtenerReclamoPorFolio(folio))!;
  }
}

export const reportService = new ReportService();
