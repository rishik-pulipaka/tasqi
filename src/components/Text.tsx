import { Text as RNText, type TextProps } from "react-native"
import { colors, fonts } from "../theme"

// Default font + color so every screen doesn't have to repeat them.
export default function Text({ style, ...props }: TextProps) {
  return <RNText {...props} style={[{ fontFamily: fonts.body, color: colors.ink }, style]} />
}
