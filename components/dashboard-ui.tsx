import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";

export function DashboardScreen({
  children,
  eyebrow,
  title,
}: PropsWithChildren<{ eyebrow: string; title: string }>) {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function MetricCard({
  color,
  icon,
  label,
  value,
}: {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export const dashboardStyles = StyleSheet.create({
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 12,
    marginTop: 25,
  },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 20 },
  card: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 9,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  row: { alignItems: "center", flexDirection: "row" },
  grow: { flex: 1 },
  label: { color: COLORS.TEXT_LIGHT, fontSize: 11, fontWeight: "700" },
  heading: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 3,
  },
  body: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  button: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_DARK,
    borderRadius: 7,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 14,
  },
  buttonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  dangerButton: { backgroundColor: COLORS.ERROR },
  mutedButton: { backgroundColor: COLORS.BACKGROUND_GRAY },
  mutedButtonText: { color: COLORS.TEXT_PRIMARY },
});

const styles = StyleSheet.create({
  safeArea: { backgroundColor: COLORS.BACKGROUND, flex: 1 },
  content: { padding: 20, paddingBottom: 35 },
  eyebrow: {
    color: COLORS.PRIMARY,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  title: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },
  metricCard: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 9,
    borderWidth: 1,
    minHeight: 122,
    padding: 13,
    width: "48%",
  },
  metricIcon: {
    alignItems: "center",
    borderRadius: 7,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  metricValue: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 23,
    fontWeight: "900",
    marginTop: 10,
  },
  metricLabel: { color: COLORS.TEXT_SECONDARY, fontSize: 11, marginTop: 2 },
});
