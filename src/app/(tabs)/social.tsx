import { Users } from "lucide-react-native"
import { StyleSheet, View } from "react-native"
import Screen from "../../components/Screen"
import Text from "../../components/Text"
import TopBar from "../../components/TopBar"
import { colors, shadow, type } from "../../theme"

export default function SocialScreen() {
  return (
    <Screen>
      <TopBar detail="Progress is better together" title="Social" />

      <View style={styles.card}>
        <View style={styles.icon}>
          <Users color={colors.lavender} size={32} strokeWidth={2} />
        </View>
        <Text style={type.eyebrow}>Coming soon</Text>
        <Text style={[type.h2, { fontSize: 25 }]}>Your Tasqi circle</Text>
        <Text style={styles.copy}>
          Friends, shared tasks, and friendly progress updates will live here in a future release.
        </Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: {
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 42,
    paddingHorizontal: 28,
    backgroundColor: colors.lavenderSoft,
    borderWidth: 1,
    borderColor: colors.lavenderLine,
    borderRadius: 26,
  },
  icon: {
    width: 76,
    height: 76,
    marginBottom: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#d8d4f1",
    borderRadius: 24,
    ...shadow("#4f4691", 0.12, 14, 12, 3),
  },
  copy: { maxWidth: 270, marginTop: 10, color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: "center" },
})
