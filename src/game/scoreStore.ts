// Mejor puntuación de la sesión (en memoria). Devuelve el mejor puntaje vigente.
let best = 0;

export function recordScore(score: number): number {
  if (score > best) best = score;
  return best;
}
