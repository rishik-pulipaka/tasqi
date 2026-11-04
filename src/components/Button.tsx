import type { ReactNode } from "react"
import { Pressable, StyleSheet, type ViewStyle } from "react-native"
import { colors, fonts, shadow } from "../theme"
import Text from "./Text"

export default function Button({
  label,
  onPress,
  icon,
  disabled,
  variant = "primary",
  active,
  style,
}: {
  label: string
  onPress: () => void
  icon?: (color: string) => ReactNode
  disabled?: boolean
  variant?: "primary" | "secondary"
  active?: boolean
  style?: ViewStyle
}) {
  const primary = variant === "primary"
  const textColor = primary ? "#fff" : active ? colors.coralDark : colors.muted

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.secondary,
        !primary && active && styles.secondaryActive,
        primary && pressed && { backgroundColor: colors.coralDark },
        disabled && { opacity: 0.45 },
        style,
      ]}
    >
      {icon?.(textColor)}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: 15,
  },
  primary: { backgroundColor: colors.coral, ...shadow(colors.coral, 0.26, 11, 10, 4) },
  secondary: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  secondaryActive: { backgroundColor: colors.coralSoft, borderColor: "#f2b6aa" },
  label: { fontFamily: fonts.bold, fontSize: 13 },
})
