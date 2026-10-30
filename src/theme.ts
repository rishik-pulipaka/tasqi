import type { TextStyle, ViewStyle } from "react-native"

export const colors = {
  ink: "#27243d",
  muted: "#757184",
  paper: "#fffdf7",
  canvas: "#eeebe3",
  line: "#e4e0d6",
  lavender: "#8278d9",
  lavenderSoft: "#ebe9fa",
  lavenderLine: "#ddd9f5",
  coral: "#eb765f",
  coralDark: "#cd5948",
  coralSoft: "#fff0ed",
  yellow: "#f3c969",
  yellowSoft: "#fff4cf",
  mint: "#b7d6ba",
  panel: "#f6f4ee",
  white: "#ffffff",
}

export const fonts = {
  body: "DMSans_400Regular",
  medium: "DMSans_500Medium",
  semibold: "DMSans_600SemiBold",
  bold: "DMSans_700Bold",
  display: "Fraunces_600SemiBold",
  displayBold: "Fraunces_700Bold",
}

export const type = {
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 4,
  } satisfies TextStyle,
  h1: {
    fontFamily: fonts.display,
    fontSize: 29,
    lineHeight: 32,
    color: colors.ink,
  } satisfies TextStyle,
  h2: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 23,
    color: colors.ink,
  } satisfies TextStyle,
}

// CSS box-shadow -> iOS shadow* + Android elevation
export const shadow = (
  color: string,
  opacity: number,
  radius: number,
  y: number,
  elevation = 4,
): ViewStyle => ({
  shadowColor: color,
  shadowOpacity: opacity,
  shadowRadius: radius,
  shadowOffset: { width: 0, height: y },
  elevation,
})
