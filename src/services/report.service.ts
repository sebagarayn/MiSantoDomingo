import {
  IReport,
  ICreateReportInput,
  IUpdateReportStatusInput,
  IRatingInput,
} from "../types";

const STORAGE_KEY = "msd_mock_reports";

// Semilla inicial de datos para Santo Domingo (coherente con las proto-personas)
const RECLAMOS_SEMILLA: IReport[] = [
  {
    folio: "SD-2026-000101",
    categoria: "Luminarias y Alumbrado",
    descripcion:
      "Poste con luz intermitente en Calle Los Aromos #450. Genera sensación de inseguridad de noche.",
    ubicacion: "Calle Los Aromos 450, Santo Domingo",
    estado: "Pendiente",
    fechaIngreso: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Hace 3 días
    unidadAsignada: "Operaciones y Servicios Públicos",
    origen: "usuario",
    creadorId: "usr-vecino-1",
    historial: [
      {
        estado: "Pendiente",
        fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        observacion: "Reclamo ingresado mediante plataforma digital.",
      },
    ],
  },
  {
    folio: "SD-2026-000088",
    categoria: "Aseo y Ornato",
    descripcion:
      "Microbasural clandestino formado en quebrada cercana a Av. Santa María.",
    ubicacion: "Av. Santa María con Las Lilas",
    estado: "Derivado",
    fechaIngreso: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // Hace 14 días
    unidadAsignada: "Medio Ambiente",
    origen: "usuario",
    creadorId: "usr-vecino-1",
    historial: [
      {
        estado: "Pendiente",
        fecha: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        observacion: "Reclamo recibido en OIRS Central.",
      },
      {
        estado: "Derivado",
        fecha: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        observacion:
          "Se deriva a cuadrilla de Medio Ambiente para retiro de escombros.",
        responsableId: "OIRS Central",
      },
    ],
  },
  {
    folio: "SD-2026-000042",
    categoria: "Vialidad y Calles",
    descripcion:
      "Bache pronunciado en calzada frente a consultorio que daña neumáticos.",
    ubicacion: "Av. El Golf frente al consultorio",
    estado: "Resuelto",
    fechaIngreso: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    unidadAsignada: "Dirección de Obras (DOM)",
    origen: "publico",
    respuestaFormal:
      "Se ejecutaron obras de bacheo asfáltico en frío el día 12 del presente mes por equipo de emergencia DOM.",
    calificacion: 5,
    historial: [
      {
        estado: "Pendiente",
        fecha: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        observacion: "Ingresado por vecino en portal público.",
      },
      {
        estado: "Resuelto",
        fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        observacion: "Trabajo concluido en terreno conforme al plan de obras.",
      },
    ],
  },
];

class ReportService {
  private getStorage(): IReport[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(RECLAMOS_SEMILLA));
        return RECLAMOS_SEMILLA;
      }
      return JSON.parse(raw);
    } catch {
      return RECLAMOS_SEMILLA;
    }
  }

  private setStorage(data: IReport[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Para elRF-04: Cálculo automático de plazo legal (20 días corridos desde el ingreso)
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

  // Listar todos los reclamos con Promise
  public async obtenerReclamos(): Promise<IReport[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.getStorage()), 100);
    });
  }

  // Para elRF-03: Consulta por Folio único
  public async obtenerReclamoPorFolio(folio: string): Promise<IReport | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = this.getStorage().find(
          (r) => r.folio.trim().toUpperCase() === folio.trim().toUpperCase(),
        );
        resolve(found || null);
      }, 150);
    });
  }

  // Para elRF-01 y RF-02: Creación de reclamo con generación de Folio único SD-2026-XXXXXX
  public async crearReclamo(
    input: ICreateReportInput,
    creadorId?: string,
  ): Promise<IReport> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reclamos = this.getStorage();
        const correlativo = Math.floor(100000 + Math.random() * 900000);
        const nuevoFolio = `SD-2026-${correlativo}`;
        const fechaActual = new Date().toISOString();

        const nuevo: IReport = {
          folio: nuevoFolio,
          categoria: input.categoria,
          descripcion: input.descripcion,
          ubicacion: input.ubicacion,
          fotoUrl: input.fotoUrl,
          estado: "Pendiente",
          fechaIngreso: fechaActual,
          unidadAsignada: "OIRS Central",
          origen: creadorId ? "usuario" : "publico",
          creadorId: creadorId,
          historial: [
            {
              estado: "Pendiente",
              fecha: fechaActual,
              observacion:
                "Reclamo ingresado exitosamente en el sistema municipal.",
            },
          ],
        };

        const actualizados = [nuevo, ...reclamos];
        this.setStorage(actualizados);
        resolve(nuevo);
      }, 200);
    });
  }

  // Para elRF-07 y RF-08: Derivar reclamo o Cerrar con respuesta formal
  public async actualizarEstado(
    folio: string,
    input: IUpdateReportStatusInput,
    respuestaFormal?: string,
  ): Promise<IReport> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const reclamos = this.getStorage();
        const index = reclamos.findIndex((r) => r.folio === folio);
        if (index === -1) return reject(new Error("Reclamo no encontrado"));

        const r = reclamos[index];
        const fecha = new Date().toISOString();

        r.estado = input.estado;
        if (input.unidadAsignada) r.unidadAsignada = input.unidadAsignada;
        if (respuestaFormal) r.respuestaFormal = respuestaFormal;

        r.historial.push({
          estado: input.estado,
          fecha,
          observacion:
            input.observacion || `Estado actualizado a ${input.estado}`,
          responsableId: input.responsableId,
        });

        reclamos[index] = r;
        this.setStorage(reclamos);
        resolve(r);
      }, 200);
    });
  }

  // Para el RF-09: Calificación de la solución municipal
  public async calificarRespuesta(
    folio: string,
    rating: IRatingInput,
  ): Promise<IReport> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const reclamos = this.getStorage();
        const index = reclamos.findIndex((r) => r.folio === folio);
        if (index === -1) return reject(new Error("Reclamo no encontrado"));

        reclamos[index].calificacion = rating.calificacion; // <-- Aquí: rating.calificacion
        this.setStorage(reclamos);
        resolve(reclamos[index]);
      }, 150);
    });
  }
}

export const reportService = new ReportService();
