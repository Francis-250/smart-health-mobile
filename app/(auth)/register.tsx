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
  amber: "#F2E9D8",
  text: "#18252B",
  muted: "#53666F",
  border: "#DDE5E4",
  danger: "#C2413B",
  success: "#087F5B",
};

type SignupRole = "patient" | "doctor";

export default function Register() {
  const [role, setRole] = useState<SignupRole>("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [submittedForApproval, setSubmittedForApproval] = useState(false);
  const {
    clearError,
    error: apiError,
    loading,
    register: registerAccount,
  } = useAuthStore();

  const handleRegister = async () => {
    Keyboard.dismiss();
    clearError();
    setLocalError("");
    setSubmittedForApproval(false);

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setLocalError("Please complete all fields.");
      return;
    }
    if (password.length < 8) {
      setLocalError("Password must contain at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    const parts = name.trim().split(/\s+/);
    const result = await registerAccount({
      email: email.trim().toLowerCase(),
      password,
      firstName: parts[0],
      lastName: parts.slice(1).join(" ") || parts[0],
      role: role === "doctor" ? "REVIEWER" : "PATIENT",
    });

    if (!result) return;
    if (result.requiresApproval) {
      setSubmittedForApproval(true);
      return;
    }
    if (result.user?.role === "patient") router.replace("/(patient)");
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
              <Text style={styles.brandSubtext}>
                Choose your workspace and create a secure account.
              </Text>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.eyebrow}>CREATE ACCOUNT</Text>
            <Text style={styles.title}>Start with the right care role</Text>
            <Text style={styles.subtitle}>
              Patients can enter immediately. Doctors are reviewed by an admin before access.
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>I am registering as</Text>
              <View style={styles.roleGrid}>
                <RoleButton
                  active={role === "patient"}
                  icon="person-outline"
                  label="Patient"
                  note="Use care tools"
                  onPress={() => setRole("patient")}
                />
                <RoleButton
                  active={role === "doctor"}
                  icon="medkit-outline"
                  label="Doctor"
                  note="Needs approval"
                  onPress={() => setRole("doctor")}
                />
              </View>

              <AuthInput
                autoComplete="name"
                icon="person-outline"
                label="Full name"
                onChangeText={(value) => {
                  setName(value);
                  clearError();
                }}
                placeholder="Your full name"
                value={name}
              />
              <AuthInput
                autoCapitalize="none"
                autoComplete="email"
                icon="mail-outline"
                keyboardType="email-address"
                label="Email"
                onChangeText={(value) => {
                  setEmail(value);
                  clearError();
                }}
                placeholder="name@example.com"
                value={email}
              />
              <PasswordInput
                label="Password"
                onChangeText={(value) => {
                  setPassword(value);
                  clearError();
                }}
                placeholder="Create a password"
                show={showPassword}
                toggle={() => setShowPassword((visible) => !visible)}
                value={password}
              />
              <PasswordInput
                label="Confirm password"
                onChangeText={(value) => {
                  setConfirmPassword(value);
                  clearError();
                }}
                onSubmitEditing={handleRegister}
                placeholder="Repeat your password"
                show={showPassword}
                toggle={() => setShowPassword((visible) => !visible)}
                value={confirmPassword}
              />

              {localError || apiError ? (
                <Text style={styles.errorText}>{localError || apiError}</Text>
              ) : null}

              {submittedForApproval ? (
                <View style={styles.pendingBox}>
                  <Ionicons name="time-outline" size={20} color={COLORS.success} />
                  <Text style={styles.pendingText}>
                    Doctor account created. Please wait for admin approval before signing in.
                  </Text>
                </View>
              ) : null}

              <Pressable
                accessibilityRole="button"
                disabled={loading}
                onPress={handleRegister}
                style={({ pressed }) => [
                  styles.submitButton,
                  loading && styles.submitButtonDisabled,
                  pressed && styles.submitButtonPressed,
                ]}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "CREATING..." : "CREATE ACCOUNT"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Already have an account?</Text>
              <Link href="/(auth)/login" asChild>
                <Pressable hitSlop={8}>
                  <Text style={styles.loginLink}>Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type AuthInputProps = React.ComponentProps<typeof TextInput> & {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

function AuthInput({ icon, label, ...props }: AuthInputProps) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name={icon} size={21} color={COLORS.muted} />
        <TextInput
          placeholderTextColor="#8B9691"
          returnKeyType="next"
          style={styles.input}
          {...props}
        />
      </View>
    </>
  );
}

function PasswordInput({
  label,
  show,
  toggle,
  ...props
}: Omit<AuthInputProps, "icon"> & { show: boolean; toggle: () => void }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={21} color={COLORS.muted} />
        <TextInput
          autoCapitalize="none"
          placeholderTextColor="#8B9691"
          returnKeyType="done"
          secureTextEntry={!show}
          style={styles.input}
          {...props}
        />
        <Pressable
          accessibilityLabel={show ? "Hide password" : "Show password"}
          hitSlop={10}
          onPress={toggle}
        >
          <Ionicons
            name={show ? "eye-off-outline" : "eye-outline"}
            size={22}
            color={COLORS.text}
          />
        </Pressable>
      </View>
    </>
  );
}

function RoleButton({
  active,
  icon,
  label,
  note,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  note: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.roleButton,
        active && styles.roleButtonActive,
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={[styles.roleIcon, active && styles.roleIconActive]}>
        <Ionicons
          name={icon}
          size={20}
          color={active ? "#FFFFFF" : COLORS.primaryDark}
        />
      </View>
      <View>
        <Text style={[styles.roleTitle, active && styles.roleTitleActive]}>
          {label}
        </Text>
        <Text style={[styles.roleNote, active && styles.roleNoteActive]}>
          {note}
        </Text>
      </View>
    </Pressable>
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
    height: 178,
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
    backgroundColor: COLORS.mint,
    borderColor: COLORS.border,
    borderRadius: 6,
    borderWidth: 1,
    left: 80,
    padding: 16,
    position: "absolute",
    right: 22,
    top: 44,
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
    marginTop: 28,
  },
  label: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 17,
  },
  roleGrid: {
    flexDirection: "row",
    gap: 10,
  },
  roleButton: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    minHeight: 70,
    padding: 12,
  },
  roleButtonActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  roleIcon: {
    alignItems: "center",
    backgroundColor: COLORS.mint,
    borderRadius: 6,
    height: 38,
    justifyContent: "center",
    marginRight: 10,
    width: 38,
  },
  roleIconActive: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  roleTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  roleTitleActive: {
    color: "#FFFFFF",
  },
  roleNote: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },
  roleNoteActive: {
    color: "#CFE5E9",
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
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    marginTop: 12,
  },
  pendingBox: {
    alignItems: "flex-start",
    backgroundColor: "#EAF8F1",
    borderColor: "#BFEAD4",
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 14,
    padding: 12,
  },
  pendingText: {
    color: COLORS.success,
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginLeft: 9,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: COLORS.primaryDark,
    borderRadius: 6,
    flexDirection: "row",
    height: 58,
    justifyContent: "center",
    marginTop: 18,
  },
  submitButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginRight: 9,
  },
  loginRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
    paddingTop: 32,
  },
  loginPrompt: {
    color: COLORS.muted,
    fontSize: 14,
    marginRight: 5,
  },
  loginLink: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});
