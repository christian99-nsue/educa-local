import {
  faBookOpen,
  faSquareRootVariable,
  faFlask,
  faAtom,
  faGlobe,
  faLanguage,
  faMicroscope,
  faVolcano,
  faDna,
  faMonument,
  faBolt,
  faCoins,
  faBook,
  faPrayingHands,
  faLaptopCode,
} from "@fortawesome/free-solid-svg-icons";

import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

const iconosPorNombre: Record<string, IconDefinition> = {
  matematicas: faSquareRootVariable,
  "matematicas I": faSquareRootVariable,
  "matematicas II": faSquareRootVariable,
  fisica: faAtom,
  quimica: faFlask,
  "ciencias naturales": faDna,
  biologia: faMicroscope,
  historia: faMonument,
  geologia: faVolcano,
  literatura: faBook,
  "lengua española": faBook,
  ingles: faLanguage,
  frances: faGlobe,
  informatica: faLaptopCode,
  economia: faCoins,
  religion: faPrayingHands,
  filosofia: faBookOpen,
  electrotecnia: faBolt,
};

const iconoDefault = faBookOpen;

export function getIconoAsignatura(nombre: string): IconDefinition {
  const key = nombre.toLowerCase().trim();
  return iconosPorNombre[key] || iconoDefault;
}
