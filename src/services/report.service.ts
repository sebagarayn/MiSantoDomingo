import {
  IReport,
  ICreateReportInput,
  IUpdateReportStatusInput,
  IRatingInput,
  IStatusHistory,
} from "../types";
import { apiFetch, API_URL, esErrorDeRed } from "./api";
import { CLAVES, guardarJSON, leerJSON } from "./almacenamiento.service";
import { catalogosService } from "./catalogos.service";

// Raiz del servidor (sin /api), para armar las URLs de las fotos
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

const normalizarNombre = (nombre: string): string =>
  nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// Busca el ID real de una categoría en la API
const obtenerIdCategoria = async (nombre: string): Promise<number> => {
  const categorias = await catalogosService.obtenerCategorias();

  const categoria = categorias.find(
    (c) => normalizarNombre(c.nombre) === normalizarNombre(nombre),
  );

  if (!categoria) {
    throw new Error(`No se encontró la categoría: ${nombre}`);
  }

  return categoria.id_categoria;
};

// Busca el ID real de una unidad municipal en la API
const obtenerIdUnidad = async (nombre: string): Promise<number> => {
  const unidades = await catalogosService.obtenerUnidades();

  const unidad = unidades.find(
    (u) => normalizarNombre(u.nombre) === normalizarNombre(nombre),
  );

  if (!unidad) {
    throw new Error(`No se encontró la unidad municipal: ${nombre}`);
  }

  return unidad.id_unidad;
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
    latitud: r.latitud == null ? null : Number(r.latitud),
    longitud: r.longitud == null ? null : Number(r.longitud),
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

  // 1. Obtener listado de reclamos desde la API (hasta 100 para bandeja y métricas)
  public async obtenerReclamos(limite = 100): Promise<IReport[]> {
    const data = await apiFetch(`/reclamos?limite=${limite}`);
    return data.reclamos.map(mapearDesdeDB);
  }

  // 1b. Igual que obtenerReclamos, pero guarda la ultima lista en el dispositivo y,
  // si no hay conexion, entrega esa copia guardada (V3: almacenamiento local)
  public async obtenerReclamosConCache(idUsuario: string): Promise<{
    reclamos: IReport[];
    desdeCache: boolean;
    guardadoEn: string | null;
  }> {
    const clave = CLAVES.cacheReclamos(idUsuario);
    try {
      const reclamos = await this.obtenerReclamos();
      guardarJSON(clave, { guardadoEn: new Date().toISOString(), reclamos });
      return { reclamos, desdeCache: false, guardadoEn: null };
    } catch (error) {
      if (esErrorDeRed(error)) {
        const copia = leerJSON<{ guardadoEn: string; reclamos: IReport[] }>(
          clave,
        );
        if (copia) {
          return {
            reclamos: copia.reclamos,
            desdeCache: true,
            guardadoEn: copia.guardadoEn,
          };
        }
      }
      throw error;
    }
  }

  // 2. Consulta publica por folio (propaga error si hay corte de red; retorna null si es 404 no encontrado)
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
    } catch (error: any) {
      // Si el servidor esta caido, dejamos que el error suba para mostrar el Toast en pantalla
      if (error.message && error.message.includes("No se pudo conectar")) {
        throw error;
      }
      // Si es un 404 (folio no existe), retornamos null silenciosamente
      return null;
    }
  }

  // 3. Crear nuevo reclamo (RF-01 y RF-02)

  public async crearReclamo(
    input: ICreateReportInput,
    _creadorId?: string,
  ): Promise<IReport> {
    const id_categoria = await obtenerIdCategoria(input.categoria);

    // Crear FormData para enviar los datos del reclamo
    const formData = new FormData();

    formData.append("id_categoria", String(id_categoria));
    formData.append("descripcion", input.descripcion);
    formData.append("ubicacion", input.ubicacion);

    // Enviar coordenadas cuando el usuario seleccione una ubicación en el mapa
    if (input.latitud !== undefined && input.longitud !== undefined) {
      formData.append("latitud", String(input.latitud));
      formData.append("longitud", String(input.longitud));
    }

    // Adjuntar fotografía si el usuario seleccionó una
    if (input.foto) {
      formData.append("foto", input.foto);
    }

    // Enviar el reclamo al backend
    const data = await apiFetch("/reclamos", {
      method: "POST",
      body: formData,
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

    let id_unidad_destino: number | undefined;

    if (input.unidadAsignada) {
      id_unidad_destino = await obtenerIdUnidad(input.unidadAsignada);
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
    const id_categoria = await obtenerIdCategoria(datos.categoria);

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
