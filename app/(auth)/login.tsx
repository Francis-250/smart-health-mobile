import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth-store";

const COLORS = {
  background: "#F6F8F7",
  surface: "#FFFFFF",
  primary: "#126E82",
  primaryDark: "#0B3D4A",
  mint: "#E7F2F4",
  mintLight: "#F1F6F6",
  amber: "#F2E9D8",
  text: "#18252B",
  muted: "#53666F",
  border: "#DDE5E4",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { clearError, error, loading, login } = useAuthStore();

  const handleLogin = async () => {
    Keyboard.dismiss();
    const user = await login(email, password);

    if (user?.role === "expert") {
      router.replace("/(expert)");
    } else if (user?.role === "patient") {
      router.replace("/(patient)");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 16}
        style={styles.keyboardView}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Pressable
              accessibilityLabel="Go back"
              hitSlop={10}
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.text} />
            </Pressable>

            <View style={styles.brandPanel}>
              <View style={styles.brandMark}>
                <Ionicons name="medical" size={28} color={COLORS.primaryDark} />
              </View>
              <Text style={styles.brandText}>Smart Health</Text>
              <Text style={styles.brandSubtext}>First aid, triage, and care navigation.</Text>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.eyebrow}>SMART HEALTH</Text>
            <Text style={styles.title}>Sign in to your care workspace</Text>
            <Text style={styles.subtitle}>
              Continue your assessments, hospital search, and emergency profile.
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={21} color={COLORS.muted} />
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  onChangeText={(value) => {
                    setEmail(value);
                    clearError();
                  }}
                  placeholder="name@example.com"
                  placeholderTextColor="#8B9691"
                  returnKeyType="next"
                  style={styles.input}
                  value={email}
                />
              </View>

              <Text style={[styles.label, styles.passwordLabel]}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={21}
                  color={COLORS.muted}
                />
                <TextInput
                  autoCapitalize="none"
                  autoComplete="password"
                  onChangeText={(value) => {
                    setPassword(value);
                    clearError();
                  }}
                  onSubmitEditing={handleLogin}
                  placeholder="Your password"
                  placeholderTextColor="#8B9691"
                  returnKeyType="done"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={password}
                />
                <Pressable
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                  hitSlop={10}
                  onPress={() => setShowPassword((visible) => !visible)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={COLORS.text}
                  />
                </Pressable>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Link href="/(auth)/forgot-password" asChild>
                <Pressable style={styles.forgotButton}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              </Link>

              <Pressable
                accessibilityRole="button"
                disabled={loading}
                onPress={handleLogin}
                style={({ pressed }) => [
                  styles.loginButton,
                  loading && styles.loginButtonDisabled,
                  pressed && styles.loginButtonPressed,
                ]}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? "SIGNING IN..." : "SIGN IN"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.signupRow}>
              <Text style={styles.signupPrompt}>Need an account?</Text>
              <Link href="/(auth)/register" asChild>
                <Pressable hitSlop={8}>
                  <Text style={styles.signupLink}>Sign up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  hero: {
    height: 198,
    overflow: "hidden",
    position: "relative",
  },
  backButton: {
    alignItems: "center",
    backgroundColor: COLORS.amber,
    borderColor: "#DFD2BA",
    borderRadius: 6,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    left: 20,
    position: "absolute",
    top: 14,
    width: 44,
    zIndex: 2,
  },
  buttonPressed: {
    opacity: 0.72,
  },
  brandPanel: {
    borderColor: COLORS.border,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: COLORS.mint,
    left: 80,
    padding: 16,
    position: "absolute",
    right: 22,
    top: 58,
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  brandText: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 12,
  },
  brandSubtext: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: "center",
  },
  title: {
    color: COLORS.text,
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: -0.7,
    lineHeight: 38,
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textAlign: "center",
  },
  form: {
    marginTop: 30,
  },
  label: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  passwordLabel: {
    marginTop: 17,
  },
  inputContainer: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    height: 58,
    paddingHorizontal: 17,
  },
  input: {
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
    height: "100%",
    marginLeft: 11,
  },
  forgotButton: {
    alignSelf: "flex-end",
    paddingBottom: 8,
    paddingTop: 12,
  },
  errorText: {
    color: "#C2413B",
    fontSize: 13,
    marginTop: 10,
  },
  forgotText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  loginButton: {
    alignItems: "center",
    backgroundColor: COLORS.primaryDark,
    borderRadius: 6,
    flexDirection: "row",
    height: 58,
    justifyContent: "center",
    marginTop: 16,
  },
  loginButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginRight: 9,
  },
  signupRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
    paddingTop: 36,
  },
  signupPrompt: {
    color: COLORS.muted,
    fontSize: 14,
    marginRight: 5,
  },
  signupLink: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});
