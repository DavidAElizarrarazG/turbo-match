# Turbo Match

Juego Match-3 de autos (de Compacto a Hípercar) hecho con **React Native**, **Expo** (SDK 57) y **Expo Router**.
Práctica 3 de Aplicaciones Móviles, Facultad de Ingeniería, Universidad La Salle México.

**Equipo:** David Alejandro Elizarraraz García (220437) y Diego Sastre Villaseñor (221320).
**Docente:** Felipe Mandujano Gómez.

## Cómo jugar
Desliza un auto hacia uno vecino (o toca dos contiguos) para intercambiarlos. Alinea 3 o más autos iguales para
eliminarlos y sumar puntos; los autos más potentes valen más y las reacciones en cadena multiplican el puntaje.
Tienes 90 segundos.

## Ejecutar en un dispositivo físico (Expo Go)
```bash
npm install
npx expo start --android      # con el teléfono Android conectado por USB y depuración USB activada
```
También puedes escanear el QR de `npx expo start` con Expo Go (teléfono y computadora en la misma red).

## Pruebas
```bash
npm test             # pruebas del motor del juego (node:test)
npx tsc --noEmit     # revisión de tipos
```

## Estructura
| Ruta | Contenido |
|---|---|
| `src/app/` | Pantallas (Expo Router): `index`, `game`, `gameover`, `credits` y `_layout` |
| `src/game/` | `engine.ts` (lógica pura), `cars.ts` (gráficos y puntos), `scoreStore.ts` |
| `src/components/` | `AppButton`, `CheckeredStrip` |
| `src/theme.ts` | **Paleta de colores**, espaciado y radios |
| `src/styles.ts` | Estilos reutilizables |
| `assets/cars/` | Gráficos de las celdas (generados con `tools/make_cars.py`) |
| `tests/` | Pruebas del motor |
| `reporte/` | Reporte de la práctica (PDF y fuentes) |
