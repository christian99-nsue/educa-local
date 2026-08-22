import {
  faFlask,
  faPaintRoller,
  faBookOpen,
  faMicrochip,
  faCodeBranch,
} from "@fortawesome/free-solid-svg-icons";

import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

const iconosPorNombre: Record<string, IconDefinition> = {
  "ciencias de la naturaleza y salud": faFlask,
  artes: faPaintRoller,
  "ciencias sociales y humanidades": faBookOpen,
  tecnologia: faMicrochip,
};

const iconoDefault = faCodeBranch;

export function getIconoRama(nombre: string): IconDefinition {
  const key = nombre.toLowerCase().trim();
  return iconosPorNombre[key] || iconoDefault;
}
