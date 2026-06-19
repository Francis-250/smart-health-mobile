import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  DashboardScreen,
  dashboardStyles,
} from "@/components/dashboard-ui";
import { COLORS } from "@/constants/colors";
import {
  ReviewCase,
  ReviewStatus,
  usePlatformStore,
} from "@/stores/platform-store";

export default function AssessmentReviews() {
  const { cases, reviewCase } = usePlatformStore();
  const [filter, setFilter] = useState<"all" | "high" | "pending">("all");
  const [selected, setSelected] = useState<ReviewCase | null>(null);
  const [note, setNote] = useState("");

  const visibleCases = cases.filter((item) => {
    if (filter === "high")
      return item.riskLevel === "high" || item.riskLevel === "critical";
    if (filter === "pending") return item.status === "pending";
    return true;
  });

  const save = (status: ReviewStatus) => {
    if (!selected) return;
    if (!note.trim()) {
      Alert.alert("Reviewer note required", "Add your clinical review note.");
      return;
    }
    reviewCase(selected.id, note.trim(), status);
    setSelected(null);
    setNote("");
  };

  if (selected) {
    return (
      <DashboardScreen eyebrow="ASSESSMENT REVIEW" title={selected.patientName}>
        <View style={styles.riskCard}>
          <Text style={styles.riskLabel}>
            {selected.riskLevel.toUpperCase()} RISK
          </Text>
          <Text style={styles.riskScore}>{selected.riskScore}%</Text>
          <Text style={dashboardStyles.body}>{selected.symptoms}</Text>
          <Text style={dashboardStyles.body}>
            Submitted {new Date(selected.createdAt).toLocaleString()}
          </Text>
        </View>
        <Text style={dashboardStyles.sectionTitle}>Clinical review</Text>
        <TextInput
          multiline
          onChangeText={setNote}
          placeholder="Add clinical observations and recommended next action..."
          placeholderTextColor={COLORS.TEXT_LIGHT}
          style={styles.noteInput}
          value={note}
        />
        <View style={styles.actions}>
          <Pressable
            onPress={() => save("reviewed")}
            style={[dashboardStyles.button, styles.actionButton]}
          >
            <Text style={dashboardStyles.buttonText}>MARK REVIEWED</Text>
          </Pressable>
          <Pressable
            onPress={() => save("escalated")}
            style={[
              dashboardStyles.button,
              dashboardStyles.dangerButton,
              styles.actionButton,
            ]}
          >
            <Text style={dashboardStyles.buttonText}>ESCALATE</Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() => setSelected(null)}
          style={[dashboardStyles.button, dashboardStyles.mutedButton]}
        >
          <Text
            style={[
              dashboardStyles.buttonText,
              dashboardStyles.mutedButtonText,
            ]}
          >
            BACK TO CASES
          </Text>
        </Pressable>
      </DashboardScreen>
    );
  }

  return (
    <DashboardScreen eyebrow="PATIENT SAFETY" title="Assessment Reviews">
      <View style={styles.filters}>
        {(["all", "high", "pending"] as const).map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[styles.filter, filter === item && styles.filterActive]}
          >
            <Text
              style={[
                styles.filterText,
                filter === item && styles.filterTextActive,
              ]}
            >
              {item.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>
      {visibleCases.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => {
            setSelected(item);
            setNote(item.reviewerNote);
          }}
          style={dashboardStyles.card}
        >
          <View style={dashboardStyles.row}>
            <View style={dashboardStyles.grow}>
              <Text
                style={[
                  dashboardStyles.label,
                  {
                    color:
                      item.riskLevel === "critical" ||
                      item.riskLevel === "high"
                        ? COLORS.ERROR
                        : COLORS.WARNING,
                  },
                ]}
              >
                {item.riskLevel.toUpperCase()} · {item.riskScore}%
              </Text>
              <Text style={dashboardStyles.heading}>{item.patientName}</Text>
              <Text numberOfLines={2} style={dashboardStyles.body}>
                {item.symptoms}
              </Text>
            </View>
            <Text style={styles.status}>{item.status}</Text>
          </View>
        </Pressable>
      ))}
    </DashboardScreen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: "row", gap: 8, marginBottom: 16, marginTop: 20 },
  filter: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterActive: { backgroundColor: COLORS.PRIMARY_DARK },
  filterText: { color: COLORS.TEXT_SECONDARY, fontSize: 10, fontWeight: "900" },
  filterTextActive: { color: "#FFFFFF" },
  status: {
    color: COLORS.PRIMARY,
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 10,
    textTransform: "uppercase",
  },
  riskCard: {
    backgroundColor: "#FFF1F0",
    borderRadius: 9,
    marginTop: 20,
    padding: 16,
  },
  riskLabel: { color: COLORS.ERROR, fontSize: 12, fontWeight: "900" },
  riskScore: {
    color: COLORS.ERROR,
    fontSize: 34,
    fontWeight: "900",
    marginTop: 5,
  },
  noteInput: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.TEXT_PRIMARY,
    minHeight: 130,
    padding: 13,
    textAlignVertical: "top",
  },
  actions: { flexDirection: "row", gap: 9, marginBottom: 10, marginTop: 14 },
  actionButton: { flex: 1 },
});
