import { useEffect, useReducer, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  PanResponder,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppButton from "../components/AppButton";
import {
  COLS,
  ROWS,
  Cell,
  Tile,
  collapse,
  createBoard,
  findRuns,
  hasMoves,
  runScore,
  shuffleBoard,
} from "../game/engine";
import { CARS } from "../game/cars";
import { recordScore } from "../game/scoreStore";
import { styles } from "../styles";
import { colors, radius, spacing } from "../theme";

const GAME_SECONDS = 90;

// Valores animados de cada mineral: posición, escala y opacidad.
type TileAnim = {
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
};
type Toast = { id: number; text: string; tone: "good" | "warn" };

const formatTime = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};
const wait = (a: Animated.CompositeAnimation) =>
  new Promise<void>((res) => a.start(() => res()));
const pause = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
const isAdjacent = (a: Cell, b: Cell) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
const inside = (c: Cell) => c.r >= 0 && c.r < ROWS && c.c >= 0 && c.c < COLS;

export default function GameScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const size = Math.floor(Math.min(width - spacing.md * 2, height * 0.55) / COLS);
  const boardPx = size * COLS;

  const newAnim = (x: number, y: number): TileAnim => ({
    x: new Animated.Value(x),
    y: new Animated.Value(y),
    scale: new Animated.Value(1),
    opacity: new Animated.Value(1),
  });

  // Tablero y valores animados: se crean una sola vez y se mutan desde la lógica (modelo imperativo).
  const [world] = useState(() => {
    const grid = createBoard();
    const anims = new Map<number, TileAnim>();
    grid.forEach((row, r) =>
      row.forEach((t, c) => t && anims.set(t.id, newAnim(c * size, r * size))),
    );
    return { grid, anims };
  });
  const { grid, anims } = world;

  const [, force] = useReducer((n: number) => n + 1, 0);
  const [timer, setTimer] = useState(GAME_SECONDS);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<Cell | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const scoreRef = useRef(0);
  const selectedRef = useRef<Cell | null>(null);
  const removing = useRef<Tile[]>([]); // minerales que se están desvaneciendo
  const busy = useRef(false); // true mientras corre una animación (ignora toques)
  const alive = useRef(true);
  const finished = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const select = (c: Cell | null) => {
    selectedRef.current = c;
    setSelected(c);
  };

  const flash = (text: string, tone: Toast["tone"]) => {
    setToast({ id: Date.now(), text, tone });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1300);
  };

  const moveTo = (t: Tile, r: number, c: number, ms: number) => {
    const a = anims.get(t.id)!;
    const cfg = { duration: ms, easing: Easing.out(Easing.quad), useNativeDriver: true };
    return Animated.parallel([
      Animated.timing(a.x, { toValue: c * size, ...cfg }),
      Animated.timing(a.y, { toValue: r * size, ...cfg }),
    ]);
  };

  const moveAll = (ms: number) => {
    const list: Animated.CompositeAnimation[] = [];
    grid.forEach((row, r) => row.forEach((t, c) => t && list.push(moveTo(t, r, c, ms))));
    return wait(Animated.parallel(list));
  };

  const trySwap = async (a: Cell, b: Cell) => {
    if (busy.current || !alive.current) return;
    busy.current = true;
    select(null);
    const ta = grid[a.r][a.c]!;
    const tb = grid[b.r][b.c]!;
    grid[a.r][a.c] = tb;
    grid[b.r][b.c] = ta;
    await wait(Animated.parallel([moveTo(ta, b.r, b.c, 150), moveTo(tb, a.r, a.c, 150)]));

    let runs = findRuns(grid);
    if (runs.length === 0) {
      // Movimiento inválido: regresan a su lugar y se avisa al jugador.
      grid[a.r][a.c] = ta;
      grid[b.r][b.c] = tb;
      await wait(Animated.parallel([moveTo(ta, a.r, a.c, 150), moveTo(tb, b.r, b.c, 150)]));
      flash("Ese intercambio no forma una línea", "warn");
      busy.current = false;
      return;
    }

    let combo = 0;
    while (runs.length > 0 && alive.current) {
      combo++;
      const gain = runs.reduce((s, run) => s + runScore(run), 0) * combo;
      scoreRef.current += gain;
      setScore(scoreRef.current);
      flash(combo > 1 ? `+${gain}  ¡Combo x${combo}!` : `+${gain}`, "good");

      // Eliminar: los minerales salen del tablero pero siguen visibles mientras se desvanecen.
      const gone = new Map<number, Tile>();
      runs.forEach((run) =>
        run.cells.forEach(({ r, c }) => {
          const t = grid[r][c];
          if (t) {
            gone.set(t.id, t);
            grid[r][c] = null;
          }
        }),
      );
      removing.current = [...gone.values()];
      force();
      await wait(
        Animated.parallel(
          removing.current.map((t) => {
            const an = anims.get(t.id)!;
            return Animated.parallel([
              Animated.timing(an.scale, { toValue: 0.2, duration: 180, useNativeDriver: true }),
              Animated.timing(an.opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
            ]);
          }),
        ),
      );
      removing.current.forEach((t) => anims.delete(t.id));
      removing.current = [];

      // Gravedad: caen los de arriba y entran minerales nuevos desde fuera del tablero.
      const spawned = collapse(grid);
      spawned.forEach(({ tile, c, fromRow }) => anims.set(tile.id, newAnim(c * size, fromRow * size)));
      force();
      await pause(32); // deja que se monten las vistas nuevas antes de animarlas
      await moveAll(230);
      runs = findRuns(grid);
    }

    if (alive.current && !hasMoves(grid)) {
      flash("Sin movimientos: mezclando…", "warn");
      shuffleBoard(grid);
      force();
      await moveAll(350);
    }
    busy.current = false;
  };

  const cellAt = (x: number, y: number): Cell => ({ r: Math.floor(y / size), c: Math.floor(x / size) });

  const onTap = (cell: Cell) => {
    if (busy.current || !inside(cell)) return;
    const sel = selectedRef.current;
    if (!sel) return select(cell);
    if (sel.r === cell.r && sel.c === cell.c) return select(null);
    if (isAdjacent(sel, cell)) return void trySwap(sel, cell);
    select(cell);
  };

  // Gestos: deslizar desde un mineral hacia un vecino, o tocar dos minerales contiguos.
  const start = useRef<Cell | null>(null);
  const handled = useRef(false);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handled.current = false;
        start.current = cellAt(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },
      onPanResponderMove: (_, g) => {
        const s = start.current;
        if (handled.current || !s || busy.current || !inside(s)) return;
        if (Math.max(Math.abs(g.dx), Math.abs(g.dy)) < size * 0.3) return;
        handled.current = true;
        const horizontal = Math.abs(g.dx) > Math.abs(g.dy);
        const target: Cell = horizontal
          ? { r: s.r, c: s.c + (g.dx > 0 ? 1 : -1) }
          : { r: s.r + (g.dy > 0 ? 1 : -1), c: s.c };
        if (inside(target)) void trySwap(s, target);
      },
      onPanResponderRelease: (_, g) => {
        if (!handled.current && start.current && Math.abs(g.dx) < 10 && Math.abs(g.dy) < 10) {
          onTap(start.current);
        }
        start.current = null;
      },
      onPanResponderTerminate: () => {
        start.current = null;
      },
    }),
  ).current;

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    const best = recordScore(scoreRef.current);
    router.replace({
      pathname: "/gameover",
      params: { score: String(scoreRef.current), best: String(best) },
    });
  };

  useEffect(() => {
    alive.current = true;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => {
      alive.current = false;
      clearInterval(interval);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    if (timer <= 0) finish();
  }, [timer]);

  const confirmExit = () =>
    Alert.alert("Terminar juego", "Se guardará tu puntuación actual. ¿Quieres terminar?", [
      { text: "Seguir jugando", style: "cancel" },
      { text: "Terminar", style: "destructive", onPress: finish },
    ]);

  const tiles: Tile[] = [];
  grid.forEach((row) => row.forEach((t) => t && tiles.push(t)));
  tiles.push(...removing.current);

  return (
    <View style={[styles.screen, { alignItems: "center", paddingBottom: insets.bottom + spacing.md }]}>
      <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.md }}>
        <View style={styles.pill}>
          <Text style={styles.pillLabel}>Tiempo</Text>
          <Text style={[styles.pillValue, timer <= 10 && { color: colors.warn }]}>
            {formatTime(Math.max(timer, 0))}
          </Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillLabel}>Puntos</Text>
          <Text style={[styles.pillValue, { color: colors.accent }]}>{score}</Text>
        </View>
      </View>

      <View
        style={{
          width: boardPx,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.surface,
          marginTop: spacing.md,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: 8,
            width: (boardPx * Math.max(timer, 0)) / GAME_SECONDS,
            backgroundColor: timer <= 10 ? colors.warn : colors.accent,
          }}
        />
      </View>

      <View style={{ height: 36, justifyContent: "center", marginTop: spacing.sm }}>
        {toast && (
          <Text
            accessibilityLiveRegion="polite"
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: toast.tone === "good" ? colors.success : colors.warn,
            }}
          >
            {toast.text}
          </Text>
        )}
      </View>

      <View
        {...panResponder.panHandlers}
        style={{
          width: boardPx,
          height: boardPx,
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {/* Todo lo de adentro ignora toques para que locationX/Y sean relativos al tablero. */}
        <View style={{ width: boardPx, height: boardPx, pointerEvents: "none" }}>
          {Array.from({ length: ROWS * COLS }, (_, i) => {
            const r = Math.floor(i / COLS);
            const c = i % COLS;
            return (
              <View
                key={i}
                style={{
                  position: "absolute",
                  left: c * size,
                  top: r * size,
                  width: size,
                  height: size,
                  backgroundColor: (r + c) % 2 === 0 ? colors.surface : colors.surfaceAlt,
                }}
              />
            );
          })}
          {tiles.map((t) => {
            const a = anims.get(t.id);
            if (!a) return null;
            return (
              <Animated.View
                key={t.id}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: size,
                  height: size,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: a.opacity,
                  transform: [{ translateX: a.x }, { translateY: a.y }, { scale: a.scale }],
                }}
              >
                <Image
                  source={CARS[t.type].image}
                  accessibilityLabel={CARS[t.type].name}
                  style={{ width: size * 0.86, height: size * 0.86 }}
                />
              </Animated.View>
            );
          })}
          {selected && (
            <View
              style={{
                position: "absolute",
                left: selected.c * size + 2,
                top: selected.r * size + 2,
                width: size - 4,
                height: size - 4,
                borderWidth: 3,
                borderColor: colors.accent,
                borderRadius: radius.sm,
              }}
            />
          )}
        </View>
      </View>

      <View style={{ marginTop: "auto", paddingTop: spacing.md }}>
        <AppButton label="Terminar juego" variant="secondary" onPress={confirmExit} />
      </View>
    </View>
  );
}
