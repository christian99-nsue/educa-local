export interface ZonaHoraria {
  value: string;
  label: string;
  offsetMinutes: number;
}

const getOffsetMinutes = (zona: string): number => {
  const date = new Date();
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: zona }));
  return (tzDate.getTime() - utcDate.getTime()) / 60000;
};

export const obtenerZonasHorarias = (): ZonaHoraria[] => {
  const zonas = Intl.supportedValuesOf("timeZone");

  return zonas
    .map((zona) => {
      const offset =
        new Intl.DateTimeFormat("en-US", {
          timeZone: zona,
          timeZoneName: "shortOffset",
        })
          .formatToParts(new Date())
          .find((part) => part.type === "timeZoneName")?.value ?? "";

      return {
        value: zona,
        label: `(${offset}) ${zona.replace(/_/g, " ")}`,
        offsetMinutes: getOffsetMinutes(zona),
      };
    })
    .sort((a, b) => a.offsetMinutes - b.offsetMinutes);
};

export const obtenerZonaHorariaLocal = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
