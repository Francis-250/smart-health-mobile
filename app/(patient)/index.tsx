import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store";
import {
  RiskLevel,
  useHealthAssistantStore,
} from "@/stores/health-assistant-store";

const RISK_COLORS: Record<RiskLevel, string> = {
  low: COLORS.SUCCESS,
  moderate: COLORS.WARNING,
  high: "#D45600",
  critical: COLORS.ERROR,
};

export default function PatientHome() {
  const user = useAuthStore((state) => state.user);
  const assessments = useHealthAssistantStore((state) =>
    state.messages
      .filter((message) => message.assessment)
      .map((message) => message.assessment!)
      .reverse(),
  );
  const latestAssessment = assessments[0];

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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

        <Text style={styles.sectionTitle}>Latest risk assessment</Text>
        {latestAssessment ? (
          <View style={styles.riskCard}>
            <View style={styles.riskHeader}>
              <View>
                <Text style={styles.riskLabel}>
                  {latestAssessment.riskLevel.toUpperCase()} RISK
                </Text>
                <Text style={styles.riskDate}>
                  {new Date(latestAssessment.createdAt).toLocaleString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.riskScore,
                  { color: RISK_COLORS[latestAssessment.riskLevel] },
                ]}
              >
                {latestAssessment.riskScore}%
              </Text>
            </View>
            <View style={styles.riskTrack}>
              <View
                style={[
                  styles.riskFill,
                  {
                    backgroundColor:
                      RISK_COLORS[latestAssessment.riskLevel],
                    width: `${latestAssessment.riskScore}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.riskSummary}>{latestAssessment.summary}</Text>
          </View>
        ) : (
          <Pressable
            onPress={() => router.push("/(patient)/assistant")}
            style={styles.emptyRisk}
          >
            <Ionicons
              name="analytics-outline"
              size={26}
              color={COLORS.PRIMARY}
            />
            <Text style={styles.emptyRiskText}>
              Complete your first AI assessment to see a risk score.
            </Text>
          </Pressable>
        )}

        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actionRow}>
          <Pressable
            onPress={() =>
              router.push("/(patient)/first-aid" as Href)
            }
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="book" size={28} color={COLORS.PRIMARY} />
            <Text style={styles.actionTitle}>First aid guides</Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.push("/(patient)/hospitals" as Href)
            }
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="location" size={28} color={COLORS.PRIMARY} />
            <Text style={styles.actionTitle}>Nearby hospitals</Text>
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
        {assessments.length > 1 ? (
          <>
            <Text style={styles.sectionTitle}>Recent history</Text>
            {assessments.slice(1, 4).map((assessment) => (
              <View key={assessment.createdAt} style={styles.historyRow}>
                <View
                  style={[
                    styles.historyDot,
                    {
                      backgroundColor: RISK_COLORS[assessment.riskLevel],
                    },
                  ]}
                />
                <View style={styles.historyContent}>
                  <Text style={styles.historyLevel}>
                    {assessment.riskLevel.toUpperCase()} ·{" "}
                    {assessment.riskScore}%
                  </Text>
                  <Text numberOfLines={1} style={styles.historySummary}>
                    {assessment.summary}
                  </Text>
                </View>
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 28,
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
  riskCard: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 10,
    borderWidth: 1,
    padding: 15,
  },
  riskHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  riskLabel: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: "900",
  },
  riskDate: {
    color: COLORS.TEXT_LIGHT,
    fontSize: 10,
    marginTop: 3,
  },
  riskScore: { fontSize: 27, fontWeight: "900" },
  riskTrack: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
    borderRadius: 4,
    height: 7,
    marginTop: 13,
    overflow: "hidden",
  },
  riskFill: { borderRadius: 4, height: "100%" },
  riskSummary: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 11,
  },
  emptyRisk: {
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    borderStyle: "dashed",
    borderWidth: 1,
    flexDirection: "row",
    padding: 15,
  },
  emptyRiskText: {
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 11,
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
  historyRow: {
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderBottomColor: COLORS.BORDER_LIGHT,
    borderBottomWidth: 1,
    flexDirection: "row",
    padding: 12,
  },
  historyDot: { borderRadius: 6, height: 12, width: 12 },
  historyContent: { flex: 1, marginLeft: 10 },
  historyLevel: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 11,
    fontWeight: "900",
  },
  historySummary: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
    marginTop: 2,
  },
});
