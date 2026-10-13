import { Image, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import AppButton from "../components/AppButton";
import CheckeredStrip from "../components/CheckeredStrip";
import { CARS } from "../game/cars";
import { styles } from "../styles";
import { colors, spacing } from "../theme";

const INSTRUCTIONS = [
  "Desliza un auto hacia uno vecino (o toca dos autos contiguos) para intercambiarlos.",
  "Alinea 3 o más autos iguales, en fila o en columna, para sacarlos de la pista y sumar puntos.",
  "Los autos más potentes dan más puntos. Las líneas de 4 o 5 y las reacciones en cadena (combos) multiplican tu puntuación.",
  "Si el intercambio no forma ninguna línea, los autos regresan a su lugar.",
  "Tienes 90 segundos de carrera. ¡Consigue la mayor puntuación!",
];

export default function Index() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <CheckeredStrip />
      <Text style={styles.title}>Turbo Match</Text>
      <Text style={styles.subtitle}>Combina autos y acelera de compacto a hípercar</Text>

      <View style={styles.card}>
        <Text style={styles.heading}>¿De qué trata?</Text>
        <Text style={styles.body}>
          Turbo Match es un juego de lógica y reflejos para tomar una pausa corta y despejar la
          mente: observa el garaje, planea tu intercambio y encadena combinaciones.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Cómo jugar</Text>
        {INSTRUCTIONS.map((t, i) => (
          <Text key={i} style={styles.body}>
            {i + 1}. {t}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Autos y potencia</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {CARS.map((g) => (
            <View key={g.name} style={{ alignItems: "center", gap: spacing.xs }}>
              <Image source={g.image} style={{ width: 52, height: 52 }} accessibilityLabel={g.name} />
              <Text style={[styles.muted, { color: colors.text, fontSize: 12 }]}>{g.name}</Text>
              <Text style={[styles.muted, { color: colors.accent, fontWeight: "700" }]}>{g.points}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.muted}>Puntos base por auto: de menor a mayor potencia.</Text>
      </View>

      <View style={{ alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm }}>
        <AppButton label="¡A correr!" onPress={() => router.replace("/game")} />
        <AppButton label="Créditos" variant="secondary" onPress={() => router.push("/credits")} />
      </View>
      <CheckeredStrip />
    </ScrollView>
  );
}
