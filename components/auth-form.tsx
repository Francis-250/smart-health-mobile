import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { PropsWithChildren, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const AUTH_COLORS = {
  background: "#F7FBF9",
  surface: "#FFFFFF",
  primary: "#087F5B",
  primaryDark: "#075D46",
  mint: "#DDF5EC",
  amber: "#FFE4A3",
  text: "#17221E",
  muted: "#6D7773",
  border: "#C9D6D1",
  error: "#C2413B",
};

type AuthFormScreenProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  footer?: ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
}>;

export function AuthFormScreen({
  children,
  footer,
  icon = "shield-checkmark",
  subtitle,
  title,
}: AuthFormScreenProps) {
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
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Go back"
              hitSlop={10}
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="chevron-back" size={24} color={AUTH_COLORS.text} />
            </Pressable>

            <View style={styles.iconBubble}>
              <Ionicons name={icon} size={38} color={AUTH_COLORS.primary} />
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.eyebrow}>SMART HEALTH</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            <View style={styles.form}>{children}</View>
            {footer}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export const sharedStyles = StyleSheet.create({
  label: {
    color: AUTH_COLORS.muted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    alignItems: "center",
    backgroundColor: AUTH_COLORS.surface,
    borderColor: AUTH_COLORS.border,
    borderRadius: 8,
    borderWidth: 1.5,
    flexDirection: "row",
    height: 58,
    paddingHorizontal: 17,
  },
  input: {
    color: AUTH_COLORS.text,
    flex: 1,
    fontSize: 15,
    height: "100%",
    marginLeft: 11,
  },
  button: {
    alignItems: "center",
    backgroundColor: AUTH_COLORS.primaryDark,
    borderRadius: 18,
    flexDirection: "row",
    height: 58,
    justifyContent: "center",
    marginTop: 26,
    shadowColor: AUTH_COLORS.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginRight: 9,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 12,
    paddingTop: 30,
  },
  footerText: {
    color: AUTH_COLORS.muted,
    fontSize: 14,
    marginRight: 5,
  },
  footerLink: {
    color: AUTH_COLORS.primaryDark,
    fontSize: 14,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  error: {
    color: AUTH_COLORS.error,
    fontSize: 13,
    marginTop: 10,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: AUTH_COLORS.background,
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  header: {
    alignItems: "center",
    height: 145,
    justifyContent: "center",
    position: "relative",
  },
  backButton: {
    alignItems: "center",
    backgroundColor: AUTH_COLORS.amber,
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    left: 20,
    position: "absolute",
    top: 14,
    width: 52,
  },
  pressed: {
    opacity: 0.72,
  },
  iconBubble: {
    alignItems: "center",
    backgroundColor: AUTH_COLORS.mint,
    borderColor: AUTH_COLORS.surface,
    borderRadius: 54,
    borderWidth: 6,
    height: 108,
    justifyContent: "center",
    marginTop: 12,
    width: 108,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
  },
  eyebrow: {
    color: AUTH_COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: "center",
  },
  title: {
    color: AUTH_COLORS.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: 37,
    textAlign: "center",
  },
  subtitle: {
    color: AUTH_COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    paddingHorizontal: 8,
    textAlign: "center",
  },
  form: {
    marginTop: 18,
  },
});
