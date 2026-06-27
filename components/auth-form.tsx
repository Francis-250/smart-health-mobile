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
  background: "#F6F8F7",
  surface: "#FFFFFF",
  primary: "#126E82",
  primaryDark: "#0B3D4A",
  mint: "#E7F2F4",
  amber: "#F2E9D8",
  text: "#18252B",
  muted: "#53666F",
  border: "#DDE5E4",
  error: "#B42318",
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
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    alignItems: "center",
    backgroundColor: AUTH_COLORS.surface,
    borderColor: AUTH_COLORS.border,
    borderRadius: 6,
    borderWidth: 1,
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
    borderRadius: 6,
    flexDirection: "row",
    height: 58,
    justifyContent: "center",
    marginTop: 26,
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
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
    borderColor: "#DFD2BA",
    borderRadius: 6,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    left: 20,
    position: "absolute",
    top: 14,
    width: 44,
  },
  pressed: {
    opacity: 0.72,
  },
  iconBubble: {
    alignItems: "center",
    backgroundColor: AUTH_COLORS.mint,
    borderColor: AUTH_COLORS.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 88,
    justifyContent: "center",
    marginTop: 12,
    width: 88,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
  },
  eyebrow: {
    color: AUTH_COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: "center",
  },
  title: {
    color: AUTH_COLORS.text,
    fontSize: 28,
    fontWeight: "900",
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
