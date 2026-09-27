import {
  IReport,
  ICreateReportInput,
  IUpdateReportStatusInput,
  IRatingInput,
} from "../types";

// Le pusimos v3 a la clave para resetear la memoria del navegador, borrar el "gfg" de las pruebas y que todo parta limpio
const STORAGE_KEY = "msd_mock_reports_v3";

// Estos son los 3 reclamos con los que arranca el sistema para Santo Domingo (coinciden exactamente con la tabla del Figma):
// 1. Uno pendiente que llega primero a OIRS Central
// 2. Uno derivado a Desarrollo Comunitario (limpio, sin respuestas raras de prueba)
// 3. Uno resuelto asignado a la vecina María con respuesta formal oficial y listo para calificar
const RECLAMOS_INICIALES: IReport[] = [
  {
    folio: "SD-2026-000101",
    categoria: "Alumbrado público",
    descripcion:
      "Poste con luz intermitente en Calle Los Aromos #450. Genera sensación de inseguridad de noche.",
    ubicacion: "Calle Los Aromos 450, Santo Domingo",
    estado: "Pendiente",
    fechaIngreso: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    unidadAsignada: "OIRS Central", // Todo reclamo nuevo llega primero a la mesa de entrada OIRS
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
    unidadAsignada: "Desarrollo comunitario", // Ya asignado a cuadrilla técnica
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
    creadorId: "usr-vecino-1", // Asignado a la vecina María para que aparezca en su lista
    calificacion: undefined, // Arranca en cero para que el profesor o nosotros podamos probar las estrellas
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
  // Esta función lee el localStorage: si no hay nada carga la semilla de arriba, y si hay datos viejos les arregla las categorías y unidades
  private getStorage(): IReport[] {
    try {
      const datosGuardados = localStorage.getItem(STORAGE_KEY);
      if (!datosGuardados) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(RECLAMOS_INICIALES));
        return RECLAMOS_INICIALES;
      }
      const listaReclamos: IReport[] = JSON.parse(datosGuardados);

      // Normalizamos cualquier dato viejo que haya quedado en caché para que coincida exactamente con los filtros del Figma
      const reclamosActualizados = listaReclamos.map((reclamo) => {
        // Aseguramos que el reclamo resuelto sea de María y esté listo para calificar
        if (reclamo.folio === "SD-2026-000042") {
          reclamo.creadorId = "usr-vecino-1";
          reclamo.origen = "usuario";
          reclamo.estado = "Resuelto";
          reclamo.categoria = "Calles y veredas";
          reclamo.unidadAsignada = "Obras municipales";
        }

        // Dejamos los nombres oficiales de categorías
        if (
          reclamo.categoria.includes("Luminarias") ||
          reclamo.categoria.includes("Alumbrado")
        ) {
          reclamo.categoria = "Alumbrado público";
        } else if (
          reclamo.categoria.includes("Aseo") ||
          reclamo.categoria.includes("Basura")
        ) {
          reclamo.categoria = "Aseo y ornato";
        } else if (
          reclamo.categoria.includes("Vialidad") ||
          reclamo.categoria.includes("Calles") ||
          reclamo.categoria.includes("Bache")
        ) {
          reclamo.categoria = "Calles y veredas";
        }

        // Dejamos los nombres oficiales de unidades municipales
        if (
          !reclamo.unidadAsignada ||
          reclamo.unidadAsignada === "OIRS Central"
        ) {
          reclamo.unidadAsignada = "OIRS Central";
        } else if (
          reclamo.unidadAsignada.includes("Operaciones") ||
          reclamo.unidadAsignada.includes("DOM") ||
          reclamo.unidadAsignada.includes("Obras")
        ) {
          reclamo.unidadAsignada = "Obras municipales";
        } else if (
          reclamo.unidadAsignada.includes("Ambiente") ||
          reclamo.unidadAsignada.includes("Comunitario") ||
          reclamo.unidadAsignada.includes("Desarrollo")
        ) {
          reclamo.unidadAsignada = "Desarrollo comunitario";
        }

        return reclamo;
      });

      return reclamosActualizados;
    } catch {
      return RECLAMOS_INICIALES;
    }
  }

  // Guarda la lista en el almacenamiento local
  private setStorage(datos: IReport[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
  }

  // Acá calculamos los 20 días legales del RF-04: si la diferencia da negativo marcamos vencido en true para pintar la alerta roja
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

  // Retornamos los reclamos con un Promise y setTimeout de 100ms para simular que consultamos un backend real (así en la EP2 el cambio es directo)
  public async obtenerReclamos(): Promise<IReport[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.getStorage()), 100);
    });
  }

  // Busca el reclamo por folio ignorando mayúsculas o minúsculas para que el vecino no tenga problemas al tipear (RF-03)
  public async obtenerReclamoPorFolio(folio: string): Promise<IReport | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reclamoEncontrado = this.getStorage().find(
          (r) => r.folio.trim().toUpperCase() === folio.trim().toUpperCase(),
        );
        resolve(reclamoEncontrado || null);
      }, 150);
    });
  }

  // Genera un folio único aleatorio tipo SD-2026-XXXXXX y guarda el nuevo reclamo (RF-01 y RF-02)
  public async crearReclamo(
    input: ICreateReportInput,
    creadorId?: string,
  ): Promise<IReport> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const listaReclamos = this.getStorage();
        const numeroRandom = Math.floor(100000 + Math.random() * 900000);
        const nuevoFolio = `SD-2026-${numeroRandom}`;
        const fechaActual = new Date().toISOString();

        const idCreador = input.creadorId || creadorId || "usr-vecino-1";
        const tipoOrigen = input.origen || (idCreador ? "usuario" : "publico");

        const nuevoReclamo: IReport = {
          folio: nuevoFolio,
          categoria: input.categoria,
          descripcion: input.descripcion,
          ubicacion: input.ubicacion,
          fotoUrl: input.fotoUrl,
          estado: "Pendiente",
          fechaIngreso: fechaActual,
          unidadAsignada: "OIRS Central", // Ingresa a mesa de entrada
          origen: tipoOrigen,
          creadorId: idCreador,
          historial: [
            {
              estado: "Pendiente",
              fecha: fechaActual,
              observacion:
                "Reclamo ingresado exitosamente en el sistema municipal.",
            },
          ],
        };

        const nuevaLista = [nuevoReclamo, ...listaReclamos];
        this.setStorage(nuevaLista);
        resolve(nuevoReclamo);
      }, 200);
    });
  }

  // Permite al funcionario derivar a otra unidad (RF-07) o cerrar con respuesta formal (RF-08) dejando registro inmutable en el historial (RNF-05)
  public async actualizarEstado(
    folio: string,
    input: IUpdateReportStatusInput,
    respuestaFormal?: string,
  ): Promise<IReport> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const lista = this.getStorage();
        const index = lista.findIndex((r) => r.folio === folio);
        if (index === -1) return reject(new Error("Reclamo no encontrado"));

        const reclamo = lista[index];
        const fecha = new Date().toISOString();

        reclamo.estado = input.estado;
        if (input.unidadAsignada) reclamo.unidadAsignada = input.unidadAsignada;
        if (respuestaFormal) reclamo.respuestaFormal = respuestaFormal;

        reclamo.historial.push({
          estado: input.estado,
          fecha,
          observacion:
            input.observacion || `Estado actualizado a ${input.estado}`,
          responsableId: input.responsableId,
        });

        lista[index] = reclamo;
        this.setStorage(lista);
        resolve(reclamo);
      }, 200);
    });
  }

  // Guarda la calificación de 1 a 5 estrellas dada por el vecino cumpliendo con el RF-09
  public async calificarRespuesta(
    folio: string,
    rating: IRatingInput,
  ): Promise<IReport> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const lista = this.getStorage();
        const index = lista.findIndex((r) => r.folio === folio);
        if (index === -1) return reject(new Error("Reclamo no encontrado"));

        lista[index].calificacion = rating.calificacion;
        this.setStorage(lista);
        resolve(lista[index]);
      }, 150);
    });
  }
}

export const reportService = new ReportService();
