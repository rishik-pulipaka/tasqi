import type { ReactNode } from "react"
import { ScrollView, type ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../theme"

export default function Screen({
  children,
  withNav = true,
  contentStyle,
}: {
  children: ReactNode
  withNav?: boolean
  contentStyle?: ViewStyle
}) {
  const insets = useSafeAreaInsets()
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.paper }}
      contentContainerStyle={[
        {
          paddingHorizontal: 24,
          paddingTop: insets.top + 14,
          paddingBottom: (withNav ? 112 : 26) + insets.bottom,
        },
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  )
}
