import { Pressable, Text } from "react-native";
import { styles } from "../styles";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

// Botón reutilizable con retroalimentación al presionar.
export default function AppButton({ label, onPress, variant = "primary" }: Props) {
  const secondary = variant === "secondary";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] },
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]}>{label}</Text>
    </Pressable>
  );
}
