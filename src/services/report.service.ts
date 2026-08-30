import { IReport } from "../types";

// Lista de reclamos de prueba
const reclamos: IReport[] = [
  {
    folio: "MSD-001",
    categoria: "Alumbrado",
    descripcion: "Luminaria en mal estado en la esquina",
    ubicacion: "Calle Principal 123",
    estado: "Pendiente",
    fechaIngreso: "2026-08-01",
    historial: [],
    origen: "usuario",
    creadorId: "1",
  },
  {
    folio: "MSD-002",
    categoria: "Basura",
    descripcion: "Acumulacion de basura en via publica",
    ubicacion: "Avenida Los Pinos 456",
    estado: "En Revisión",
    fechaIngreso: "2026-08-05",
    historial: [],
    origen: "publico",
  },
];

// Devuelve todos los reclamos
export function obtenerReclamos(): IReport[] {
  return reclamos;
}

// Devuelve un reclamo especifico por su folio
export function obtenerReclamoPorFolio(folio: string): IReport | undefined {
  return reclamos.find((r) => r.folio === folio);
}
