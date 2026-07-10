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
  faMicrochip,
  faCompassDrafting,
  faCalculator,
  faPalette,
  faEarthEurope,
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
  "tecnologia industrial ii": faMicrochip,
  "dibujo tecnico": faCompassDrafting,
  "matematicas aplicadas": faCalculator,
  "historia del arte": faPalette,
  latin: faEarthEurope,
  griego: faEarthEurope,
};

const iconoDefault = faBookOpen;

export function getIconoAsignatura(nombre: string): IconDefinition {
  const key = nombre.toLowerCase().trim();
  return iconosPorNombre[key] || iconoDefault;
}
