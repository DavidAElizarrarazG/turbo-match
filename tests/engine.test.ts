// Pruebas de la lógica del juego. Ejecutar con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  COLS,
  ROWS,
  POINTS,
  type Grid,
  collapse,
  createBoard,
  findRuns,
  hasMoves,
  newTile,
  runScore,
  shuffleBoard,
} from "../src/game/engine.ts";

const fromTypes = (rows: number[][]): Grid => rows.map((r) => r.map((t) => newTile(t)));
// Tablero sin líneas: el tipo depende de (fila + 2*columna) mod 5.
const base = (): number[][] =>
  Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => (r + 2 * c) % 5));

test("createBoard: 200 tableros sin líneas formadas y con movimientos", () => {
  for (let i = 0; i < 200; i++) {
    const g = createBoard();
    assert.equal(findRuns(g).length, 0);
    assert.ok(hasMoves(g));
    assert.equal(g.flat().filter(Boolean).length, ROWS * COLS);
  }
});

test("findRuns: detecta línea horizontal de 3", () => {
  const t = base();
  t[2][1] = t[2][2] = t[2][3] = 4;
  const runs = findRuns(fromTypes(t));
  assert.equal(runs.length, 1);
  assert.equal(runs[0].cells.length, 3);
  assert.equal(runs[0].type, 4);
});

test("findRuns: detecta línea vertical de 4", () => {
  const t = base();
  for (let r = 1; r <= 4; r++) t[r][5] = 3;
  const runs = findRuns(fromTypes(t));
  assert.equal(runs.length, 1);
  assert.equal(runs[0].cells.length, 4);
});

test("findRuns: dos minerales iguales no cuentan", () => {
  const t = base();
  t[3][0] = t[3][1] = 4;
  assert.equal(findRuns(fromTypes(t)).length, 0);
});

test("runScore: más largo y más valioso puntúa más", () => {
  assert.equal(runScore({ type: 0, cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }] }), POINTS[0] * 3);
  const four = runScore({ type: 0, cells: [0, 1, 2, 3].map((c) => ({ r: 0, c })) });
  assert.equal(four, POINTS[0] * 4 * 2);
  const diamond3 = runScore({ type: 4, cells: [0, 1, 2].map((c) => ({ r: 0, c })) });
  assert.ok(diamond3 > runScore({ type: 0, cells: [0, 1, 2].map((c) => ({ r: 0, c })) }));
});

test("collapse: no deja huecos y reporta los minerales nuevos", () => {
  const g = createBoard();
  g[6][0] = g[5][0] = g[6][3] = null;
  const spawned = collapse(g);
  assert.equal(g.flat().filter((t) => t === null).length, 0);
  assert.equal(spawned.length, 3);
  assert.ok(spawned.every((s) => s.fromRow < 0));
});

test("shuffleBoard: conserva los minerales y deja un tablero jugable", () => {
  const g = createBoard();
  const ids = g.flat().map((t) => t!.id).sort((a, b) => a - b);
  shuffleBoard(g);
  assert.deepEqual(g.flat().map((t) => t!.id).sort((a, b) => a - b), ids);
  assert.equal(findRuns(g).length, 0);
  assert.ok(hasMoves(g));
});
