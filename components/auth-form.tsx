import { Ionicons } from "@expo/vector-icons";
import type { PropsWithChildren, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const AUTH_COLORS = {
  background: "#F8FAFF",
  surface: "#FFFFFF",
  primary: "#0B4AAE",
  primaryDark: "#083D99",
  blueSoft: "#EAF1FF",
  mint: "#EAFBF4",
  text: "#111827",
  muted: "#6B7280",
  border: "#C7CEDD",
  borderLight: "#E2E8F0",
  error: "#B42318",
  green: "#047857",
};

type AuthFormScreenProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  bottomNote?: ReactNode;
  cardIcon?: keyof typeof Ionicons.glyphMap;
  footer?: ReactNode;
  hero?: ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  topSpacer?: number;
}>;

export function AuthFormScreen({
  bottomNote,
  cardIcon,
  children,
  footer,
  hero,
  icon,
  subtitle,
  title,
  topSpacer = 138,
}: AuthFormScreenProps) {
  const displayedCardIcon = cardIcon ?? icon;

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
          <View pointerEvents="none" style={styles.topGlow} />
          <View pointerEvents="none" style={styles.bottomGlow} />

          <BrandHeader />

          {hero}

          <View style={styles.content}>
            <View style={{ height: hero ? 28 : topSpacer }} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            <View style={styles.card}>
              {displayedCardIcon ? (
                <View style={styles.cardIcon}>
                  <Ionicons
                    name={displayedCardIcon}
                    size={43}
                    color={AUTH_COLORS.primary}
                  />
                </View>
              ) : null}
              {children}
            </View>
            {footer}
          </View>
          {bottomNote}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function BrandHeader() {
  return (
    <View style={styles.brandHeader}>
      <Ionicons name="medical-outline" size={29} color={AUTH_COLORS.primary} />
      <Text style={styles.brandText}>Smart Health</Text>
    </View>
  );
}

export const sharedStyles = StyleSheet.create({
  label: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.1,
    marginBottom: 9,
    marginTop: 20,
  },
  inputContainer: {
    alignItems: "center",
    backgroundColor: AUTH_COLORS.surface,
    borderColor: AUTH_COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    height: 64,
    paddingHorizontal: 20,
  },
  input: {
    color: AUTH_COLORS.text,
    flex: 1,
    fontSize: 18,
    height: "100%",
    marginRight: 12,
  },
  button: {
    alignItems: "center",
    backgroundColor: AUTH_COLORS.primaryDark,
    borderRadius: 14,
    flexDirection: "row",
    height: 64,
    justifyContent: "center",
    marginTop: 30,
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.2,
    marginRight: 12,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 20,
    paddingTop: 26,
  },
  footerText: {
    color: "#374151",
    fontSize: 17,
    marginRight: 6,
  },
  footerLink: {
    color: AUTH_COLORS.primaryDark,
    fontSize: 17,
    fontWeight: "800",
  },
  error: {
    color: AUTH_COLORS.error,
    fontSize: 14,
    marginTop: 12,
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
    overflow: "hidden",
    paddingBottom: 28,
  },
  topGlow: {
    backgroundColor: AUTH_COLORS.blueSoft,
    borderRadius: 240,
    height: 420,
    opacity: 0.55,
    position: "absolute",
    right: -145,
    top: 92,
    width: 420,
  },
  bottomGlow: {
    backgroundColor: AUTH_COLORS.mint,
    borderRadius: 250,
    bottom: 60,
    height: 420,
    left: -155,
    opacity: 0.68,
    position: "absolute",
    width: 420,
  },
  brandHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 13,
    justifyContent: "center",
    paddingTop: 18,
  },
  brandText: {
    color: AUTH_COLORS.primaryDark,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    color: AUTH_COLORS.text,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 43,
    textAlign: "center",
  },
  subtitle: {
    color: "#374151",
    fontSize: 19,
    lineHeight: 28,
    marginTop: 12,
    paddingHorizontal: 12,
    textAlign: "center",
  },
  card: {
    backgroundColor: AUTH_COLORS.surface,
    borderColor: AUTH_COLORS.borderLight,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 34,
    padding: 28,
  },
  cardIcon: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: AUTH_COLORS.blueSoft,
    borderRadius: 58,
    height: 104,
    justifyContent: "center",
    marginBottom: 34,
    marginTop: 8,
    width: 104,
  },
});
