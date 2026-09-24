// INTERFACES Y TIPOS DE DATOS

// Roles del sistema (Vecino y funcionario municipal (admin))
export type UserRole = "vecino" | "admin";

// Estados por los que puede pasar un reclamo durante su ciclo de atencion
export type ReportStatus =
  | "Pendiente"
  | "En Revisión"
  | "Derivado"
  | "Resuelto"
  | "Rechazado";

// Origen del reclamo: puede ser anonimo si se hace en el portal publico o con cuenta vecinal
export type ReportOrigin = "publico" | "usuario";

// Estructura del usuario en sesion
export interface IUser {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  fechaRegistro?: string;
}

// Historial de trazabilidad de cada cambio de estado (RNF-05)
export interface IStatusHistory {
  estado: ReportStatus;
  fecha: string; // Utiliza el formato ISO 8601
  observacion?: string;
  responsableId?: string;
}

// Entidad principal de un reclamo municipal
export interface IReport {
  folio: string; // Codigo unico (Por ejemplo SD-2026-000101)
  categoria: string;
  descripcion: string;
  ubicacion: string;
  fotoUrl?: string;
  estado: ReportStatus;
  fechaIngreso: string;
  unidadAsignada?: string; // Unidad municipal responsable
  historial: IStatusHistory[];
  respuestaFormal?: string; // Respuesta oficial emitida al resolver
  calificacion?: number; // Evaluacion de 1 a 5 estrellas (RF-09)
  creadorId?: string;
  origen: ReportOrigin;
}

// Datos que se envian al crear un nuevo reclamo (RF-01)
export interface ICreateReportInput {
  categoria: string;
  descripcion: string;
  ubicacion: string;
  fotoUrl?: string;
  origen: ReportOrigin;
  creadorId?: string;
}

// Datos que usa el funcionario para derivar (RF-07) o cerrar (RF-08)
export interface IUpdateReportStatusInput {
  estado: ReportStatus;
  observacion?: string;
  unidadAsignada?: string;
  responsableId: string;
}

// Datos para calificar una respuesta municipal resuelta (RF-09)
export interface IRatingInput {
  calificacion: number; // Escala 1 a 5
  comentario?: string;
}

// ESTRUCTURAS BASE PARA LA ENTREGA 2 (BACKEND + JWT)

// Estructura estandar de respuesta del backend
export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// Estructura de sesion con token JWT
export interface IAuthSession {
  token: string;
  user: IUser;
  expiresAt?: string;
}
