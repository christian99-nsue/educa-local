import countriesData from "world-countries";

export interface Pais {
  nombre: string;
  codigoIso: string;
  codigoTelefono: string;
}

export const obtenerPaises = (): Pais[] => {
  return countriesData
    .map((pais) => ({
      nombre: pais.translations?.spa?.common ?? pais.name.common,
      codigoIso: pais.cca2,
      codigoTelefono: pais.idd?.root
        ? `${pais.idd.root}${pais.idd.suffixes?.[0] ?? ""}`
        : "",
    }))
    .filter((pais) => pais.codigoTelefono)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
};
