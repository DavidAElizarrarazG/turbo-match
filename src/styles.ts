import { StyleSheet } from "react-native";
import { colors, radius, spacing } from "./theme";

// Estilos reutilizables en todas las pantallas.
export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.bg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: 38,
    fontWeight: "900",
    color: colors.accent,
    textAlign: "center",
    letterSpacing: 1,
    fontStyle: "italic",
    textTransform: "uppercase",
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    textAlign: "center",
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
    color: colors.text,
  },
  muted: {
    fontSize: 14,
    color: colors.muted,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    minWidth: 200,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.bg,
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.accent,
  },
  buttonSecondaryText: {
    color: colors.accent,
  },
  pill: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    minWidth: 96,
  },
  pillLabel: {
    fontSize: 12,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  pillValue: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
});
