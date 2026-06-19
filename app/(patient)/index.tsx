import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store";

export default function PatientHome() {
  const user = useAuthStore((state) => state.user);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>SMART HEALTH</Text>
        <Text style={styles.greeting}>Hello, {user?.name.split(" ")[0]}</Text>
        <Text style={styles.subtitle}>How can we help you today?</Text>

        <Pressable
          onPress={() => router.push("/(patient)/assistant")}
          style={({ pressed }) => [styles.aiCard, pressed && styles.pressed]}
        >
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={29} color="#FFFFFF" />
          </View>
          <View style={styles.aiContent}>
            <Text style={styles.aiLabel}>AI HEALTH ASSISTANT</Text>
            <Text style={styles.aiTitle}>Talk to Smart Health AI</Text>
            <Text style={styles.aiDescription}>
              Ask a health question, describe symptoms, or share an image.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => router.push("/(patient)/doctors")}
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="medical" size={28} color={COLORS.PRIMARY} />
            <Text style={styles.actionTitle}>Find a doctor</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(patient)/appointments")}
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="calendar" size={28} color={COLORS.PRIMARY} />
            <Text style={styles.actionTitle}>Appointments</Text>
          </Pressable>
        </View>

        <View style={styles.reminder}>
          <Ionicons
            name="shield-checkmark"
            size={23}
            color={COLORS.PRIMARY_DARK}
          />
          <View style={styles.reminderContent}>
            <Text style={styles.reminderTitle}>Your health matters</Text>
            <Text style={styles.reminderText}>
              AI guidance does not replace professional medical care.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  eyebrow: {
    color: COLORS.PRIMARY,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.6,
  },
  greeting: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 30,
    fontWeight: "800",
    marginTop: 5,
  },
  subtitle: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 15,
    marginTop: 4,
  },
  aiCard: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_DARK,
    borderRadius: 12,
    flexDirection: "row",
    marginTop: 28,
    padding: 18,
  },
  aiIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.17)",
    borderRadius: 10,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  aiContent: {
    flex: 1,
    marginHorizontal: 13,
  },
  aiLabel: {
    color: "#B7F0DD",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  aiTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  },
  aiDescription: {
    color: "#D8EEE7",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 12,
    marginTop: 28,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    padding: 16,
  },
  actionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 13,
  },
  reminder: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: 10,
    flexDirection: "row",
    marginTop: 24,
    padding: 15,
  },
  reminderContent: {
    flex: 1,
    marginLeft: 12,
  },
  reminderTitle: {
    color: COLORS.PRIMARY_DARK,
    fontSize: 14,
    fontWeight: "800",
  },
  reminderText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.8,
  },
});
