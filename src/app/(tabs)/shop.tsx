import { ShoppingBag } from "lucide-react-native"
import { StyleSheet, View } from "react-native"
import Pet from "../../components/Pet"
import Screen from "../../components/Screen"
import Text from "../../components/Text"
import TopBar from "../../components/TopBar"
import { colors, fonts, type } from "../../theme"

const shapes = [
  { width: 54, height: 38, borderTopLeftRadius: 27, borderTopRightRadius: 27, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  { width: 64, height: 22, borderRadius: 999 },
  { width: 42, height: 48, borderRadius: 13, transform: [{ rotate: "8deg" }] },
  { width: 50, height: 50, borderRadius: 25 },
]

export default function ShopScreen() {
  return (
    <Screen>
      <TopBar detail="Treat your companion" title="Tasqi shop" />

      <View style={styles.hero}>
        <View style={styles.heroCircle} />
        <View style={{ flex: 1.3 }}>
          <Text style={type.eyebrow}>Featured collection</Text>
          <Text style={[type.h2, { fontSize: 25, lineHeight: 27, maxWidth: 170 }]}>Make Tasqi yours</Text>
          <Text style={styles.heroCopy}>Complete tasks to earn coins, then come back to unlock new looks.</Text>
        </View>
        <View style={styles.heroPet}>
          <Pet small />
        </View>
      </View>

      <View style={{ marginTop: 25 }}>
        <View style={styles.heading}>
          <View>
            <Text style={type.eyebrow}>Coming soon</Text>
            <Text style={type.h2}>Accessories</Text>
          </View>
          <View style={styles.preview}>
            <Text style={styles.previewText}>Preview</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {shapes.map((shape, i) => (
            <View accessibilityLabel="Future shop item" key={i} style={styles.slot}>
              <View style={[{ backgroundColor: "#e7e3da" }, shape]} />
              <Text style={styles.slotText}>Item slot</Text>
            </View>
          ))}
        </View>

        <View style={styles.note}>
          <ShoppingBag color={colors.lavender} size={19} />
          <Text style={styles.noteText}>Cosmetics, boosts, and Free-B days will live here.</Text>
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 190,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    padding: 23,
    backgroundColor: "#f8dd93",
    borderWidth: 1,
    borderColor: "#ecd17f",
    borderRadius: 26,
  },
  heroCircle: {
    position: "absolute",
    right: -45,
    bottom: -80,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,253,247,0.42)",
  },
  heroCopy: { maxWidth: 210, marginTop: 10, color: "#6d5a32", fontSize: 12, lineHeight: 18 },
  heroPet: { flex: 0.7, alignItems: "center", alignSelf: "flex-end", transform: [{ scale: 1.1 }, { translateY: 7 }] },
  heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  preview: { paddingVertical: 7, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.lavenderSoft },
  previewText: { fontFamily: fonts.bold, fontSize: 11, color: colors.lavender },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 11 },
  slot: {
    width: "48%",
    aspectRatio: 1.12,
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#cbc6bb",
    borderRadius: 18,
  },
  slotText: { fontFamily: fonts.bold, fontSize: 10.5, letterSpacing: 0.6, textTransform: "uppercase", color: "#aaa59a" },
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    padding: 13,
    backgroundColor: colors.lavenderSoft,
    borderRadius: 15,
  },
  noteText: { flex: 1, fontSize: 11.5, color: colors.muted },
})
