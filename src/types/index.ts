// Acá definimos los dos roles que nos pide la pauta, el vecino que reporta y el funcionario municipal (admin)
export type UserRole = "vecino" | "admin";

// Los 5 estados por los que va pasando el reclamo según el flujo de la municipalidad
export type ReportStatus =
  | "Pendiente"
  | "En Revisión"
  | "Derivado"
  | "Resuelto"
  | "Rechazado";

// El origen nos sirve para diferenciar si el vecino entró con su cuenta o si hizo la consulta anónima sin sesión
export type ReportOrigin = "publico" | "usuario";

// Estructura del usuario para saber quién está conectado y qué permisos tiene en las rutas
export interface IUser {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  fechaRegistro?: string;
}

// Este tipo es clave para cumplir con la trazabilidad (RNF-05): guarda la fecha y quién hizo cada cambio de estado
export interface IStatusHistory {
  estado: ReportStatus;
  fecha: string; // Formato de fecha ISO estándar
  observacion?: string;
  responsableId?: string;
}

// Esta es la entidad central del proyecto: reúne todos los datos del reclamo, su estado y su resolución
export interface IReport {
  folio: string; // Código único alfanumérico generado automáticamente (RF-02)
  categoria: string;
  descripcion: string;
  ubicacion: string;
  fotoUrl?: string;
  estado: ReportStatus;
  fechaIngreso: string;
  unidadAsignada?: string; // Cuadrilla o dirección técnica municipal a cargo
  historial: IStatusHistory[];
  respuestaFormal?: string; // Respuesta oficial obligatoria que deja el funcionario al resolver (RF-08)
  calificacion?: number; // Nota de 1 a 5 estrellas que le pone el vecino a la solución (RF-09)
  creadorId?: string;
  origen: ReportOrigin;
}

// Lo que captura el formulario de ingreso cuando el vecino envía una nueva solicitud (RF-01)
export interface ICreateReportInput {
  categoria: string;
  descripcion: string;
  ubicacion: string;
  fotoUrl?: string;
  origen: ReportOrigin;
  creadorId?: string;
}

// Lo que envía el funcionario cuando traspasa el reclamo a otra unidad (RF-07) o cuando lo cierra formalmente (RF-08)
export interface IUpdateReportStatusInput {
  estado: ReportStatus;
  observacion?: string;
  unidadAsignada?: string;
  responsableId: string;
}

// Los datos que se mandan al evaluar la respuesta municipal (RF-09)
export interface IRatingInput {
  calificacion: number; // Escala del 1 al 5
  comentario?: string;
}

// ESTO ES PARA LA ENTREGA 2

// Estructura estándar para cuando conectemos las respuestas del backend
export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// Modelo de sesión con token JWT para cuando tengamos la base de datos real
export interface IAuthSession {
  token: string;
  user: IUser;
  expiresAt?: string;
}
