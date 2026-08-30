// TIPOS E INTERFACES

/**
 * ROLES DE USUARIO EN EL SISTEMA
 * - vecino: Usuario residencial que reporta reclamos
 * - admin: Funcionario municipal que gestiona reclamos
 */
export type UserRole = "vecino" | "admin";

/**
 * ESTADOS POSIBLES DE UN RECLAMO
 * - Pendiente: Recién ingresado, sin revisión
 * - En Revisión: Siendo analizado por funcionarios
 * - Derivado: Asignado a una unidad municipal específica
 * - Resuelto: Completado con respuesta formal
 * - Rechazado: No procede su atención
 */
export type ReportStatus =
  | "Pendiente"
  | "En Revisión"
  | "Derivado"
  | "Resuelto"
  | "Rechazado";

/**
 * ORIGEN DEL RECLAMO
 * - publico: Ingresado por persona sin cuenta
 * - usuario: Ingresado por vecino autenticado
 */
export type ReportOrigin = "publico" | "usuario";

/**
 * INTERFAZ DE USUARIO DEL SISTEMA
 */
export interface IUser {
  /** Identificador único del usuario */
  id: string;
  /** Nombre completo del usuario */
  nombre: string;
  /** Correo electrónico (usado para autenticación) */
  email: string;
  /** Rol del usuario en el sistema */
  rol: UserRole;
  /** Fecha de creación de la cuenta (formato ISO 8601) */
  fechaRegistro?: string;
}

/**
 * Entrada de historial de estados de un reclamo
 * Registra cada cambio de estado para trazabilidad
 */
export interface IStatusHistory {
  /** Estado del reclamo en este punto */
  estado: ReportStatus;
  /** Fecha y hora del cambio (formato ISO 8601) */
  fecha: string;
  /** Observación o comentario del funcionario */
  observacion?: string;
  /** ID del funcionario responsable del cambio */
  responsableId?: string;
}

/**
 * INTERFAZ PRINCIPAL DE UN RECLAMO MUNICIPAL
 */
export interface IReport {
  /** Folio único público para seguimiento (ej: MSD-2026-0001) */
  folio: string;
  /** Categoría del reclamo (Alumbrado, Pavimento, Basura, etc) */
  categoria: string;
  /** Descripción detallada del problema */
  descripcion: string;
  /** Dirección o referencia de ubicación */
  ubicacion: string;
  /** URL de fotografía adjunta (opcional) */
  fotoUrl?: string;
  /** Estado actual del reclamo */
  estado: ReportStatus;
  /** Fecha de ingreso del reclamo (formato ISO 8601) */
  fechaIngreso: string;
  /** Unidad municipal asignada para resolución */
  unidadAsignada?: string;
  /** Historial completo de cambios de estado */
  historial: IStatusHistory[];
  /** Respuesta formal emitida por el municipio */
  respuestaFormal?: string;
  /** Calificación del servicio (1-5 estrellas), solo si está resuelto */
  calificacion?: number;
  /** ID del usuario creador (undefined si es anónimo) */
  creadorId?: string;
  /** Origen del reclamo */
  origen: ReportOrigin;
}

/**
 * DATOS NECESARIOS PARA CREAR UN RECLAMO
 */
export interface ICreateReportInput {
  /** Categoría del reclamo */
  categoria: string;
  /** Descripción detallada del problema */
  descripcion: string;
  /** Dirección o referencia de ubicación */
  ubicacion: string;
  /** URL de fotografía adjunta (opcional) */
  fotoUrl?: string;
  /** Origen del reclamo */
  origen: ReportOrigin;
  /** ID del usuario creador (si aplica) */
  creadorId?: string;
}

/**
 * DATOS NECESARIOS PARA ACTUALIZAR EL ESTADO DE UN RECLAMO
 */
export interface IUpdateReportStatusInput {
  /** Nuevo estado del reclamo */
  estado: ReportStatus;
  /** Observación o comentario del funcionario */
  observacion?: string;
  /** Unidad municipal asignada */
  unidadAsignada?: string;
  /** ID del funcionario responsable */
  responsableId: string;
}

/**
 * DATOS NECESARIOS PARA CALIFICAR UN RECLAMO RESUELTO
 */
export interface IRatingInput {
  /** Calificación de 1 a 5 estrellas */
  calificacion: number;
  /** Comentario opcional sobre la atención */
  comentario?: string;
}

/**
 * ESTRUCTURA DE RESPUESTA DE LA API
 * Se usará en la EP2 cuando se conecte con el backend
 */
export interface IApiResponse<T> {
  /** Éxito o fracaso de la operación */
  success: boolean;
  /** Mensaje descriptivo */
  message: string;
  /** Datos de la respuesta */
  data?: T;
  /** Errores de validación si los hay */
  errors?: string[];
}

/**
 * ESTRUCTURA DE SESIÓN DE AUTENTICACIÓN
 * Se usará en la EP2 con JWT
 */
export interface IAuthSession {
  /** Token de acceso JWT */
  token: string;
  /** Información del usuario autenticado */
  user: IUser;
  /** Fecha de expiración del token */
  expiresAt?: string;
}
