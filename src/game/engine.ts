// Lógica pura del juego (sin React): tablero, detección de líneas, gravedad y puntuación.
// Se mantiene separada de la interfaz para poder probarla sin dispositivo.

export const ROWS = 7;
export const COLS = 7;
export const TYPES = 5; // hierro < cobre < plata < oro < diamante

// Puntos base por tipo de mineral: a mayor "poder", más puntos.
export const POINTS = [10, 20, 35, 60, 100];

export type Tile = { id: number; type: number };
export type Grid = (Tile | null)[][];
export type Cell = { r: number; c: number };
export type Run = { type: number; cells: Cell[] };
export type Spawn = { tile: Tile; r: number; c: number; fromRow: number };

let nextId = 1;
export const newTile = (type: number = Math.floor(Math.random() * TYPES)): Tile => ({
  id: nextId++,
  type,
});

const emptyGrid = (): Grid =>
  Array.from({ length: ROWS }, () => Array<Tile | null>(COLS).fill(null));

const typeAt = (g: Grid, r: number, c: number) => g[r]?.[c]?.type;

// ¿Colocar `type` en (r,c) cerraría una línea con las celdas ya llenas (izquierda/arriba)?
const wouldMatch = (g: Grid, r: number, c: number, type: number) =>
  (typeAt(g, r, c - 1) === type && typeAt(g, r, c - 2) === type) ||
  (typeAt(g, r - 1, c) === type && typeAt(g, r - 2, c) === type);

// Tablero inicial: sin líneas ya formadas y con al menos un movimiento posible.
export function createBoard(): Grid {
  let g: Grid;
  do {
    g = emptyGrid();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let t: Tile;
        do {
          t = newTile();
        } while (wouldMatch(g, r, c, t.type));
        g[r][c] = t;
      }
    }
  } while (!hasMoves(g));
  return g;
}

// Todas las líneas horizontales y verticales de 3 o más minerales iguales.
export function findRuns(g: Grid): Run[] {
  const runs: Run[] = [];
  for (let r = 0; r < ROWS; r++) {
    let c = 0;
    while (c < COLS) {
      const t = g[r][c];
      let e = c + 1;
      while (t && e < COLS && g[r][e]?.type === t.type) e++;
      if (t && e - c >= 3) {
        const cells: Cell[] = [];
        for (let k = c; k < e; k++) cells.push({ r, c: k });
        runs.push({ type: t.type, cells });
      }
      c = e;
    }
  }
  for (let c = 0; c < COLS; c++) {
    let r = 0;
    while (r < ROWS) {
      const t = g[r][c];
      let e = r + 1;
      while (t && e < ROWS && g[e][c]?.type === t.type) e++;
      if (t && e - r >= 3) {
        const cells: Cell[] = [];
        for (let k = r; k < e; k++) cells.push({ r: k, c });
        runs.push({ type: t.type, cells });
      }
      r = e;
    }
  }
  return runs;
}

// Puntos de una línea: valor del mineral x longitud x bono por longitud (3 -> x1, 4 -> x2, 5 -> x3).
export const runScore = (run: Run) =>
  POINTS[run.type] * run.cells.length * (run.cells.length - 2);

// ¿Existe al menos un intercambio de celdas vecinas que forme una línea?
export function hasMoves(g: Grid): boolean {
  const swap = (a: Cell, b: Cell) => {
    const t = g[a.r][a.c];
    g[a.r][a.c] = g[b.r][b.c];
    g[b.r][b.c] = t;
  };
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of [
        [0, 1],
        [1, 0],
      ]) {
        const r2 = r + dr;
        const c2 = c + dc;
        if (r2 >= ROWS || c2 >= COLS) continue;
        swap({ r, c }, { r: r2, c: c2 });
        const ok = findRuns(g).length > 0;
        swap({ r, c }, { r: r2, c: c2 });
        if (ok) return true;
      }
    }
  }
  return false;
}

// Gravedad: los minerales caen a los huecos y entran nuevos por arriba.
// Devuelve los minerales nuevos con la fila (fuera del tablero) desde la que deben caer.
export function collapse(g: Grid): Spawn[] {
  const spawned: Spawn[] = [];
  for (let c = 0; c < COLS; c++) {
    let write = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      const t = g[r][c];
      if (t) {
        g[r][c] = null;
        g[write][c] = t;
        write--;
      }
    }
    const missing = write + 1;
    for (let r = write; r >= 0; r--) {
      const tile = newTile();
      g[r][c] = tile;
      spawned.push({ tile, r, c, fromRow: r - missing });
    }
  }
  return spawned;
}

// Mezcla los minerales existentes cuando no quedan movimientos (conserva los mismos objetos).
export function shuffleBoard(g: Grid) {
  const tiles = g.flat().filter((t): t is Tile => t !== null);
  const place = () => {
    let k = 0;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) g[r][c] = tiles[k++];
  };
  for (let tries = 0; tries < 500; tries++) {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    place();
    if (findRuns(g).length === 0 && hasMoves(g)) return;
  }
  // Último recurso: reasignar tipos al azar hasta tener un tablero válido.
  do {
    tiles.forEach((t) => (t.type = Math.floor(Math.random() * TYPES)));
    place();
  } while (findRuns(g).length > 0 || !hasMoves(g));
}
