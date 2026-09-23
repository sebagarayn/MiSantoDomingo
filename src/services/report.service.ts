import {
  IReport,
  ICreateReportInput,
  IUpdateReportStatusInput,
  IRatingInput,
} from "../types";

// Clave para guardar los reclamos en el almacenamiento del navegador
const STORAGE_KEY = "msd_mock_reports_v2";

// Semilla con los reclamos de prueba iniciales para la comuna de Santo Domingo
const RECLAMOS_SEMILLA: IReport[] = [
  {
    folio: "SD-2026-000101",
    categoria: "Alumbrado público",
    descripcion:
      "Poste con luz intermitente en Calle Los Aromos #450. Genera sensación de inseguridad de noche.",
    ubicacion: "Calle Los Aromos 450, Santo Domingo",
    estado: "Pendiente",
    fechaIngreso: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    unidadAsignada: "OIRS Central", // Todo reclamo nuevo llega primero a OIRS Central
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
    categoria: "Aseo y ornato",
    descripcion:
      "Microbasural clandestino formado en quebrada cercana a Av. Santa María.",
    ubicacion: "Av. Santa María con Las Lilas",
    estado: "Derivado",
    fechaIngreso: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    unidadAsignada: "Desarrollo comunitario", // Derivado a unidad ejecutora
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
        observacion: "Se deriva para coordinar retiro de escombros en terreno.",
        responsableId: "OIRS Central",
      },
    ],
  },
  {
    folio: "SD-2026-000042",
    categoria: "Calles y veredas",
    descripcion:
      "Bache pronunciado en calzada frente a consultorio que daña neumáticos.",
    ubicacion: "Av. El Golf frente al consultorio",
    estado: "Resuelto",
    fechaIngreso: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    unidadAsignada: "Obras municipales",
    origen: "usuario",
    creadorId: "usr-vecino-1", // Asignado a la vecina Maria para que aparezca en su lista
    calificacion: undefined, // Arranca sin nota para que el profesor o nosotros podamos probar las estrellas
    respuestaFormal:
      "Se ejecutaron obras de bacheo asfaltico en frio el dia 12 del presente mes por equipo de emergencia.",
    historial: [
      {
        estado: "Pendiente",
        fecha: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        observacion: "Ingresado por vecina en portal municipal.",
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
  // Obtiene los reclamos de localStorage o inicializa con la semilla
  private getStorage(): IReport[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(RECLAMOS_SEMILLA));
        return RECLAMOS_SEMILLA;
      }
      const data: IReport[] = JSON.parse(raw);

      // Normaliza cualquier dato viejo que haya quedado guardado en cache
      const dataLimpia = data.map((r) => {
        // Asegura que el reclamo resuelto sea de la vecina y este listo para calificar
        if (r.folio === "SD-2026-000042") {
          r.creadorId = "usr-vecino-1";
          r.origen = "usuario";
          r.estado = "Resuelto";
          r.categoria = "Calles y veredas";
          r.unidadAsignada = "Obras municipales";
        }

        // Limpia nombres de categorias para que calcen con el selector
        if (
          r.categoria.includes("Luminarias") ||
          r.categoria.includes("Alumbrado")
        ) {
          r.categoria = "Alumbrado público";
        } else if (
          r.categoria.includes("Aseo") ||
          r.categoria.includes("Basura")
        ) {
          r.categoria = "Aseo y ornato";
        } else if (
          r.categoria.includes("Vialidad") ||
          r.categoria.includes("Calles") ||
          r.categoria.includes("Bache")
        ) {
          r.categoria = "Calles y veredas";
        }

        // Limpia nombres de unidades para que calcen con el filtro
        if (!r.unidadAsignada || r.unidadAsignada === "OIRS Central") {
          r.unidadAsignada = "OIRS Central";
        } else if (
          r.unidadAsignada.includes("Operaciones") ||
          r.unidadAsignada.includes("DOM") ||
          r.unidadAsignada.includes("Obras")
        ) {
          r.unidadAsignada = "Obras municipales";
        } else if (
          r.unidadAsignada.includes("Ambiente") ||
          r.unidadAsignada.includes("Comunitario") ||
          r.unidadAsignada.includes("Desarrollo")
        ) {
          r.unidadAsignada = "Desarrollo comunitario";
        }

        return r;
      });

      return dataLimpia;
    } catch {
      return RECLAMOS_SEMILLA;
    }
  }

  // Guarda los cambios en el almacenamiento local
  private setStorage(data: IReport[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Calcula dias restantes del plazo legal de 20 dias corridos (RF-04)
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

  // Retorna todos los reclamos con Promise simulando una API real
  public async obtenerReclamos(): Promise<IReport[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.getStorage()), 100);
    });
  }

  // Busca un reclamo por su numero de folio unico (RF-03)
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

  // Crea un nuevo reclamo y genera el folio SD-2026-XXXXXX automaticamente (RF-01 y RF-02)
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

        const creadorIdFinal = input.creadorId || creadorId || "usr-vecino-1";
        const origenFinal =
          input.origen || (creadorIdFinal ? "usuario" : "publico");

        const nuevo: IReport = {
          folio: nuevoFolio,
          categoria: input.categoria,
          descripcion: input.descripcion,
          ubicacion: input.ubicacion,
          fotoUrl: input.fotoUrl,
          estado: "Pendiente",
          fechaIngreso: fechaActual,
          unidadAsignada: "OIRS Central", // Ingresa a mesa de entrada
          origen: origenFinal,
          creadorId: creadorIdFinal,
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

  // Actualiza estado: deriva a otra unidad (RF-07) o cierra formalmente (RF-08)
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

  // Guarda la calificacion de 1 a 5 estrellas dada por el ciudadano (RF-09)
  public async calificarRespuesta(
    folio: string,
    rating: IRatingInput,
  ): Promise<IReport> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const reclamos = this.getStorage();
        const index = reclamos.findIndex((r) => r.folio === folio);
        if (index === -1) return reject(new Error("Reclamo no encontrado"));

        reclamos[index].calificacion = rating.calificacion;
        this.setStorage(reclamos);
        resolve(reclamos[index]);
      }, 150);
    });
  }
}

export const reportService = new ReportService();
