export type SistemaCalificacion = "sobre-10" | "sobre-100" | "A-F";

const letraAValor: Record<string, number> = {
  A: 95,
  B: 85,
  C: 75,
  D: 65,
  F: 50,
};

export const valorALetra = (valor: number): string => {
  if (valor >= 90) return "A";
  if (valor >= 80) return "B";
  if (valor >= 70) return "C";
  if (valor >= 60) return "D";
  return "F";
};

export const notaANumero = (
  nota: string,
  sistema: SistemaCalificacion,
): number | null => {
  if (sistema === "A-F") {
    const valor = letraAValor[nota.toUpperCase()];
    return valor ?? null;
  }
  const num = Number(nota);
  if (isNaN(num)) return null;
  if (sistema === "sobre-10") return num * 10;
  return num;
};

export const formatearPromedioDisplay = (
  promedioPorcentaje: number,
  sistema: SistemaCalificacion,
): string => {
  if (sistema === "A-F") return valorALetra(promedioPorcentaje);
  if (sistema === "sobre-100") return promedioPorcentaje.toFixed(1);
  // sobre-10: convertir porcentaje de vuelta a escala 0-10
  return ((promedioPorcentaje / 100) * 10).toFixed(1);
};

export const getEstado = (promedioPorcentaje: number): string => {
  if (promedioPorcentaje >= 90) return "Excelente";
  if (promedioPorcentaje >= 70) return "Bueno";
  if (promedioPorcentaje >= 50) return "Aceptable";
  return "Insuficiente";
};

export const estadoColor: Record<string, { bg: string; color: string }> = {
  Excelente: { bg: "#f0d5fc", color: "#B032E7" },
  Bueno: { bg: "#dcfce7", color: "#16a34a" },
  Aceptable: { bg: "#fef3c7", color: "#d97706" },
  Insuficiente: { bg: "#fee2e2", color: "#dc2626" },
};
