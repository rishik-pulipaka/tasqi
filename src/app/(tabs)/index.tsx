import { useRouter } from "expo-router"
import { ChevronRight, Heart, Plus } from "lucide-react-native"
import { Pressable, StyleSheet, View } from "react-native"
import Button from "../../components/Button"
import Pet from "../../components/Pet"
import Screen from "../../components/Screen"
import Text from "../../components/Text"
import TopBar from "../../components/TopBar"
import { useApp } from "../../context/AppContext"
import { colors, fonts, type } from "../../theme"
import { dayKey } from "../../utils/dates"

export default function HomeScreen() {
  const router = useRouter()
  const { tasks, username } = useApp()

  const today = new Date()
  const upcoming = tasks.filter((task) => task.date === dayKey(today) && !task.done).slice(0, 2)

  return (
    <Screen>
      <TopBar
        detail={today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        title={`Hi, ${username}`}
      />

      <View style={styles.petCard}>
        <View style={styles.status}>
          <Text style={styles.statusText}>Feeling focused</Text>
          <View style={styles.health}>
            <Heart color={colors.coralDark} fill={colors.coralDark} size={15} />
            <Text style={styles.healthText}>92%</Text>
          </View>
        </View>
        <View style={styles.stage}>
          <View style={styles.halo} />
          <Pet />
        </View>
        <View style={styles.footer}>
          <View>
            <Text style={type.eyebrow}>Your companion</Text>
            <Text style={type.h2}>Tasqi is thriving</Text>
          </View>
          <View style={styles.streak}>
            <Text style={styles.streakText}>4 day streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <View>
            <Text style={type.eyebrow}>Keep it going</Text>
            <Text style={type.h2}>Up next</Text>
          </View>
          <Pressable hitSlop={8} onPress={() => router.navigate("/tasks")}>
            <Text style={styles.textButton}>View all</Text>
          </Pressable>
        </View>

        <View style={{ gap: 8 }}>
          {upcoming.length ? (
            upcoming.map((task, index) => (
              <Pressable key={task.id} onPress={() => router.navigate("/tasks")} style={styles.upcoming}>
                <View style={[styles.dot, index === 1 && { backgroundColor: colors.yellow }]} />
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={styles.upcomingTitle}>{task.title}</Text>
                  <Text style={styles.upcomingTime}>{task.time}</Text>
                </View>
                <ChevronRight color={colors.ink} size={18} />
              </Pressable>
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>All done for today. Tasqi is proud of you.</Text>
            </View>
          )}
        </View>

        <Button
          icon={(c) => <Plus color={c} size={19} />}
          label="Add a task"
          onPress={() => router.navigate("/tasks")}
          style={{ marginTop: 12 }}
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  petCard: {
    overflow: "hidden",
    padding: 18,
    backgroundColor: colors.lavenderSoft,
    borderWidth: 1,
    borderColor: colors.lavenderLine,
    borderRadius: 26,
  },
  status: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statusText: { fontFamily: fonts.bold, fontSize: 12.5 },
  health: { flexDirection: "row", alignItems: "center", gap: 5 },
  healthText: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.coralDark },
  stage: { height: 225, alignItems: "center", justifyContent: "center" },
  halo: {
    position: "absolute",
    width: 196,
    height: 196,
    borderRadius: 98,
    backgroundColor: "#fffdf8",
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(39,36,61,0.1)",
  },
  streak: { paddingVertical: 7, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "#f8dd93" },
  streakText: { fontFamily: fonts.bold, fontSize: 11, color: "#6f5518" },
  section: { marginTop: 28 },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  textButton: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.coralDark },
  upcoming: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
  },
  dot: { width: 10, height: 34, borderRadius: 99, backgroundColor: colors.lavender },
  upcomingTitle: { fontFamily: fonts.bold, fontSize: 13.8 },
  upcomingTime: { fontSize: 11.5, color: colors.muted },
  empty: { padding: 20, backgroundColor: colors.panel, borderRadius: 16 },
  emptyText: { fontSize: 13, color: colors.muted, textAlign: "center" },
})
