import { POINTS } from "./engine";

// Un mineral por tipo; el índice coincide con `Tile.type` y con POINTS (poder creciente).
export const GEMS = [
  { name: "Hierro", points: POINTS[0], image: require("../../assets/gems/hierro.png") },
  { name: "Cobre", points: POINTS[1], image: require("../../assets/gems/cobre.png") },
  { name: "Plata", points: POINTS[2], image: require("../../assets/gems/plata.png") },
  { name: "Oro", points: POINTS[3], image: require("../../assets/gems/oro.png") },
  { name: "Diamante", points: POINTS[4], image: require("../../assets/gems/diamante.png") },
];
