import { Bell, CalendarDays, ChevronRight, LogOut, Moon, UserRound } from "lucide-react-native"
import { useState } from "react"
import { Pressable, StyleSheet, Switch, View } from "react-native"
import Screen from "../../components/Screen"
import Text from "../../components/Text"
import TopBar from "../../components/TopBar"
import { useApp } from "../../context/AppContext"
import { colors, fonts, type } from "../../theme"

function Row({
  icon,
  iconBg,
  title,
  subtitle,
  right,
  onPress,
  last,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  subtitle: string
  right: React.ReactNode
  onPress?: () => void
  last?: boolean
}) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{subtitle}</Text>
      </View>
      {right}
    </Pressable>
  )
}

export default function SettingsScreen() {
  const { username, logout } = useApp()
  const [notifications, setNotifications] = useState(true)
  const [taskReminders, setTaskReminders] = useState(true)

  const track = { false: "#d7d3da", true: colors.lavender }

  return (
    <Screen>
      <TopBar detail="Make Tasqi feel like yours" title="Settings" />

      <View style={styles.profile}>
        <View style={styles.avatar}>
          <UserRound color={colors.lavender} size={25} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={type.eyebrow}>Your profile</Text>
          <Text style={type.h2}>{username}</Text>
          <Text style={styles.profileCopy}>Profile editing will be available with account login.</Text>
        </View>
      </View>

      <View style={{ marginTop: 26 }}>
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.card}>
          <Row
            icon={<Bell color={colors.lavender} size={18} />}
            iconBg={colors.lavenderSoft}
            right={<Switch onValueChange={setNotifications} thumbColor="#fff" trackColor={track} value={notifications} />}
            subtitle="General Tasqi updates"
            title="Notifications"
          />
          <Row
            icon={<CalendarDays color={colors.coralDark} size={18} />}
            iconBg={colors.coralSoft}
            right={<Switch onValueChange={setTaskReminders} thumbColor="#fff" trackColor={track} value={taskReminders} />}
            subtitle="Alerts before tasks are due"
            title="Task reminders"
          />
          <Row
            icon={<Moon color="#846521" size={18} />}
            iconBg={colors.yellowSoft}
            last
            onPress={() => {}}
            right={<ChevronRight color={colors.ink} size={18} />}
            subtitle="Light theme"
            title="Appearance"
          />
        </View>
      </View>

      <Pressable onPress={logout} style={styles.logout}>
        <LogOut color={colors.coralDark} size={18} />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </Screen>
  )
}

const styles = StyleSheet.create({
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 17,
    backgroundColor: colors.lavenderSoft,
    borderWidth: 1,
    borderColor: colors.lavenderLine,
    borderRadius: 21,
  },
  avatar: {
    width: 53,
    height: 53,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#d8d4f1",
    borderRadius: 17,
  },
  profileCopy: { marginTop: 5, color: colors.muted, fontSize: 11, lineHeight: 15 },
  sectionLabel: {
    marginLeft: 4,
    marginBottom: 9,
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 10.9,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  card: { overflow: "hidden", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 20 },
  row: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 11 },
  rowTitle: { fontFamily: fonts.bold, fontSize: 12.8 },
  rowSub: { fontSize: 10.9, color: colors.muted },
  logout: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
    backgroundColor: colors.coralSoft,
    borderWidth: 1,
    borderColor: "#f2c0b7",
    borderRadius: 15,
  },
  logoutText: { fontFamily: fonts.bold, fontSize: 12.8, color: colors.coralDark },
})
