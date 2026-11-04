import { Tabs } from "expo-router"
import { Home, ListTodo, Settings, ShoppingBag, Users } from "lucide-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors, fonts, shadow } from "../../theme"

export default function TabsLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.paper },
        tabBarActiveTintColor: colors.lavender,
        tabBarInactiveTintColor: "#8a8695",
        tabBarActiveBackgroundColor: colors.lavenderSoft,
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 10 },
        tabBarItemStyle: { borderRadius: 15, marginHorizontal: 1 },
        tabBarStyle: {
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 10 + insets.bottom,
          height: 71,
          paddingTop: 7,
          paddingBottom: 7,
          paddingHorizontal: 7,
          backgroundColor: "rgba(255,253,247,0.96)",
          borderWidth: 1,
          borderTopWidth: 1,
          borderColor: colors.line,
          borderTopColor: colors.line,
          borderRadius: 21,
          ...shadow(colors.ink, 0.14, 17, 12, 8),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: ({ color }) => <Home color={color} size={21} strokeWidth={2.3} /> }}
      />
      <Tabs.Screen
        name="tasks"
        options={{ title: "Tasks", tabBarIcon: ({ color }) => <ListTodo color={color} size={21} strokeWidth={2.3} /> }}
      />
      <Tabs.Screen
        name="shop"
        options={{ title: "Shop", tabBarIcon: ({ color }) => <ShoppingBag color={color} size={21} strokeWidth={2.3} /> }}
      />
      <Tabs.Screen
        name="social"
        options={{ title: "Social", tabBarIcon: ({ color }) => <Users color={color} size={21} strokeWidth={2.3} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: "Settings", tabBarIcon: ({ color }) => <Settings color={color} size={21} strokeWidth={2.3} /> }}
      />
    </Tabs>
  )
}
