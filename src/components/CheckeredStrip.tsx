import { View } from "react-native";

// Franja de bandera a cuadros: motivo decorativo reutilizable de la identidad de carreras.
export default function CheckeredStrip({ squares = 28, size = 10 }: { squares?: number; size?: number }) {
  return (
    <View style={{ width: "100%", overflow: "hidden", borderRadius: 4 }} accessibilityElementsHidden>
      {[0, 1].map((row) => (
        <View key={row} style={{ flexDirection: "row" }}>
          {Array.from({ length: squares }, (_, i) => (
            <View
              key={i}
              style={{ flex: 1, height: size, backgroundColor: (i + row) % 2 === 0 ? "#F5F6FA" : "#0D0E13" }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
