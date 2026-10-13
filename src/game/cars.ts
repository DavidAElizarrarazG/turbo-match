import { POINTS } from "./engine";

// Un auto por tipo; el índice coincide con `Tile.type` y con POINTS (potencia creciente).
export const CARS = [
  { name: "Compacto", points: POINTS[0], image: require("../../assets/cars/compacto.png") },
  { name: "Sedán", points: POINTS[1], image: require("../../assets/cars/sedan.png") },
  { name: "SUV", points: POINTS[2], image: require("../../assets/cars/suv.png") },
  { name: "Deportivo", points: POINTS[3], image: require("../../assets/cars/deportivo.png") },
  { name: "Hípercar", points: POINTS[4], image: require("../../assets/cars/hipercar.png") },
];
