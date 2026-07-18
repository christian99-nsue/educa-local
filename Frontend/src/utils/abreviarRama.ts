const PALABRAS_IGNORADAS = ["de", "la", "el", "los", "las", "y", "del"];

export const abreviarRama = (rama: string | null): string => {
  if (!rama) return "";
  const palabras = rama
    .split(" ")
    .filter((p) => !PALABRAS_IGNORADAS.includes(p.toLowerCase()));
  return palabras.map((p) => p[0]?.toUpperCase()).join("");
};
