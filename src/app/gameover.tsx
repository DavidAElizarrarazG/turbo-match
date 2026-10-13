import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AppButton from "../components/AppButton";
import CheckeredStrip from "../components/CheckeredStrip";
import { styles } from "../styles";
import { colors } from "../theme";

export default function GameOver() {
  const { score = "0", best = "0" } = useLocalSearchParams<{ score?: string; best?: string }>();
  const isRecord = Number(score) > 0 && Number(score) >= Number(best);

  return (
    <View style={styles.centered}>
      <View style={{ width: "100%" }}>
        <CheckeredStrip />
      </View>
      <Text style={[styles.title, { fontSize: 32 }]}>¡Fin de la carrera!</Text>
      <View style={[styles.card, { alignItems: "center", minWidth: 240 }]}>
        <Text style={styles.pillLabel}>Tu puntuación</Text>
        <Text style={[styles.title, { fontSize: 56, color: colors.text }]}>{score}</Text>
        <Text style={styles.muted}>Mejor de la sesión: {best}</Text>
        {isRecord && (
          <Text style={[styles.heading, { color: colors.success }]}>¡Nuevo récord!</Text>
        )}
      </View>
      <View style={{ gap: 10 }}>
        <AppButton label="Jugar de nuevo" onPress={() => router.replace("/game")} />
        <AppButton label="Inicio" variant="secondary" onPress={() => router.replace("/")} />
        <AppButton label="Créditos" variant="secondary" onPress={() => router.push("/credits")} />
      </View>
    </View>
  );
}
