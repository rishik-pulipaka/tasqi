import { ChevronRight, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react-native"
import { useRef, useState, type ComponentRef } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native"
import Pet from "../components/Pet"
import Text from "../components/Text"
import { useApp } from "../context/AppContext"
import { colors, fonts, shadow, type } from "../theme"

export default function LoginScreen() {
  const { login } = useApp()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState<"username" | "password" | null>(null)
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null)

  const canSubmit = !!username.trim() && !!password

  const submit = () => {
    if (!canSubmit) return
    login(username.trim())
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.brand}>
            <View style={styles.petBox}>
              <View style={{ transform: [{ translateY: 8 }] }}>
                <Pet small />
              </View>
            </View>
            <Text style={type.eyebrow}>Welcome to Tasqi</Text>
            <Text style={[type.h1, { fontSize: 28, textAlign: "center" }]}>Good to see you</Text>
            <Text style={styles.brandCopy}>
              Log in to check on your pet and keep your momentum going.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Username</Text>
            <View style={[styles.input, focused === "username" && styles.inputFocused]}>
              <UserRound color={colors.lavender} size={19} />
              <TextInput
                autoCapitalize="none"
                autoComplete="username"
                autoCorrect={false}
                onBlur={() => setFocused(null)}
                onChangeText={setUsername}
                onFocus={() => setFocused("username")}
                onSubmitEditing={() => passwordRef.current?.focus()}
                placeholder="Enter your username"
                placeholderTextColor="#aaa6b2"
                returnKeyType="next"
                style={styles.textInput}
                value={username}
              />
            </View>

            <Text style={[styles.label, { marginTop: 15 }]}>Password</Text>
            <View style={[styles.input, focused === "password" && styles.inputFocused]}>
              <LockKeyhole color={colors.lavender} size={19} />
              <TextInput
                autoCapitalize="none"
                autoComplete="current-password"
                onBlur={() => setFocused(null)}
                onChangeText={setPassword}
                onFocus={() => setFocused("password")}
                onSubmitEditing={submit}
                placeholder="Enter your password"
                placeholderTextColor="#aaa6b2"
                ref={passwordRef}
                returnKeyType="go"
                secureTextEntry={!showPassword}
                style={styles.textInput}
                value={password}
              />
              <Pressable
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                hitSlop={6}
                onPress={() => setShowPassword((visible) => !visible)}
                style={styles.eye}
              >
                {showPassword ? (
                  <EyeOff color={colors.muted} size={18} />
                ) : (
                  <Eye color={colors.muted} size={18} />
                )}
              </Pressable>
            </View>

            <Pressable
              disabled={!canSubmit}
              onPress={submit}
              style={({ pressed }) => [
                styles.button,
                pressed && { backgroundColor: colors.coralDark },
                !canSubmit && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.buttonText}>Login</Text>
              <ChevronRight color="#fff" size={20} />
            </Pressable>
          </View>

          <Text style={styles.note}>This prototype accepts any username and password.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  scroll: { flexGrow: 1, justifyContent: "center", paddingVertical: 28, paddingHorizontal: 24 },
  card: {
    padding: 22,
    paddingTop: 26,
    paddingBottom: 20,
    backgroundColor: "rgba(255,253,247,0.94)",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 28,
    ...shadow(colors.ink, 0.13, 27, 22, 6),
  },
  brand: { alignItems: "center" },
  petBox: {
    width: 102,
    height: 102,
    marginTop: -10,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.lavenderSoft,
    borderWidth: 1,
    borderColor: "#d8d4f1",
    borderRadius: 32,
  },
  brandCopy: {
    maxWidth: 280,
    marginTop: 9,
    color: colors.muted,
    fontSize: 12.5,
    lineHeight: 19,
    textAlign: "center",
  },
  form: { marginTop: 24 },
  label: {
    marginLeft: 2,
    marginBottom: 7,
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  input: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
  },
  inputFocused: { borderColor: "#aaa3e4" },
  textInput: { flex: 1, minWidth: 0, padding: 0, color: colors.ink, fontFamily: fonts.body, fontSize: 16 },
  eye: { width: 38, height: 38, marginRight: -7, alignItems: "center", justifyContent: "center" },
  button: {
    minHeight: 52,
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingLeft: 20,
    paddingRight: 16,
    backgroundColor: colors.coral,
    borderRadius: 18,
    ...shadow(colors.coral, 0.26, 11, 10, 4),
  },
  buttonDisabled: { opacity: 0.48, shadowOpacity: 0, elevation: 0 },
  buttonText: { color: "#fff", fontFamily: fonts.bold, fontSize: 16, letterSpacing: 0.2 },
  note: { marginTop: 16, color: colors.muted, fontSize: 10.5, textAlign: "center" },
})
