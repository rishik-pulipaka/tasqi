import { Coins } from "lucide-react-native"
import { StyleSheet, View } from "react-native"
import { colors, fonts, type } from "../theme"
import Text from "./Text"

export default function TopBar({ title, detail }: { title: string; detail?: string }) {
  return (
    <View style={styles.bar}>
      <View>
        <Text style={type.eyebrow}>{detail ?? "Tasqi"}</Text>
        <Text style={type.h1}>{title}</Text>
      </View>
      <View accessibilityLabel="240 coins" style={styles.coin}>
        <Coins color="#806120" size={17} />
        <Text style={styles.coinText}>240</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  coin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: colors.yellowSoft,
    borderWidth: 1,
    borderColor: "#f1dfa6",
    borderRadius: 999,
  },
  coinText: { fontFamily: fonts.bold, fontSize: 13.4, color: "#806120" },
})
