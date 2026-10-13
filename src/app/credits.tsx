import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import AppButton from "../components/AppButton";
import CheckeredStrip from "../components/CheckeredStrip";
import { styles } from "../styles";
import { colors } from "../theme";

const TEAM = [
  { name: "David Alejandro Elizarraraz García", id: "220437" },
  { name: "Diego Sastre Villaseñor", id: "221320" },
];

export default function Credits() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <CheckeredStrip />
      <Text style={styles.title}>Créditos</Text>

      <View style={styles.card}>
        <Text style={styles.heading}>Equipo de desarrollo</Text>
        {TEAM.map((p) => (
          <View key={p.id}>
            <Text style={styles.body}>{p.name}</Text>
            <Text style={styles.muted}>Matrícula {p.id}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Curso</Text>
        <Text style={styles.body}>Aplicaciones Móviles · Práctica 3</Text>
        <Text style={styles.muted}>Docente: Felipe Mandujano Gómez</Text>
        <Text style={styles.muted}>Facultad de Ingeniería · Universidad La Salle México</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Tecnología y recursos</Text>
        <Text style={styles.body}>React Native · Expo · Expo Router</Text>
        <Text style={[styles.muted, { color: colors.muted }]}>
          Los gráficos de los autos fueron diseñados por el equipo para esta práctica.
        </Text>
      </View>

      <View style={{ alignItems: "center", paddingVertical: 8 }}>
        <AppButton label="Regresar al inicio" onPress={() => router.replace("/")} />
      </View>
      <CheckeredStrip />
    </ScrollView>
  );
}
