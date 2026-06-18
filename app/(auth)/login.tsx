import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
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

const COLORS = {
  background: "#F7FBF9",
  surface: "#FFFFFF",
  primary: "#087F5B",
  primaryDark: "#075D46",
  mint: "#DDF5EC",
  mintLight: "#EDF9F5",
  amber: "#FFE4A3",
  text: "#17221E",
  muted: "#6D7773",
  border: "#C9D6D1",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

            <View style={[styles.bubble, styles.bubbleLarge]}>
              <Ionicons name="heart" size={34} color={COLORS.primary} />
            </View>
            <View style={[styles.bubble, styles.bubbleTop]}>
              <Ionicons name="fitness" size={24} color={COLORS.primaryDark} />
            </View>
            <View style={[styles.bubble, styles.bubbleRight]}>
              <Ionicons name="medkit" size={29} color="#B06F00" />
            </View>
            <View style={[styles.bubble, styles.bubbleBottom]}>
              <Ionicons name="pulse" size={27} color={COLORS.primary} />
            </View>
            <View style={styles.decorativeDot} />
          </View>

          <View style={styles.content}>
            <Text style={styles.eyebrow}>SMART HEALTH</Text>
            <Text style={styles.title}>Welcome back to{"\n"}Smart Health</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your care journey.
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={21} color={COLORS.muted} />
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="example@email.com"
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
                  onChangeText={setPassword}
                  placeholder="Enter your password"
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

              <Link href="/(auth)/forgot-password" asChild>
                <Pressable style={styles.forgotButton}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              </Link>

              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && styles.loginButtonPressed,
                ]}
              >
                <Text style={styles.loginButtonText}>LOGIN</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.signupRow}>
              <Text style={styles.signupPrompt}>New to Smart Health?</Text>
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
    height: 210,
    overflow: "hidden",
    position: "relative",
  },
  backButton: {
    alignItems: "center",
    backgroundColor: COLORS.amber,
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    left: 20,
    position: "absolute",
    top: 14,
    width: 52,
    zIndex: 2,
  },
  buttonPressed: {
    opacity: 0.72,
  },
  bubble: {
    alignItems: "center",
    borderColor: COLORS.surface,
    borderRadius: 999,
    borderWidth: 5,
    justifyContent: "center",
    position: "absolute",
  },
  bubbleLarge: {
    backgroundColor: COLORS.mint,
    height: 142,
    left: 96,
    top: -52,
    transform: [{ rotate: "12deg" }],
    width: 184,
  },
  bubbleTop: {
    backgroundColor: "#C6EDDF",
    height: 82,
    right: -16,
    top: -18,
    width: 82,
  },
  bubbleRight: {
    backgroundColor: "#FFF0C9",
    height: 100,
    right: -24,
    top: 82,
    width: 100,
  },
  bubbleBottom: {
    backgroundColor: COLORS.mintLight,
    height: 90,
    right: 77,
    top: 92,
    transform: [{ rotate: "-8deg" }],
    width: 108,
  },
  decorativeDot: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 8,
    height: 16,
    left: 17,
    position: "absolute",
    top: 3,
    width: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: "center",
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "800",
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
    fontWeight: "600",
    marginBottom: 8,
  },
  passwordLabel: {
    marginTop: 17,
  },
  inputContainer: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1.5,
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
  forgotText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  loginButton: {
    alignItems: "center",
    backgroundColor: COLORS.primaryDark,
    borderRadius: 18,
    flexDirection: "row",
    height: 58,
    justifyContent: "center",
    marginTop: 16,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  loginButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
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
