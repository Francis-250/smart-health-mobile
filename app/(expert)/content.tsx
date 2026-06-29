import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
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
import { api, getApiError } from "@/lib/api";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";

type ManageTip = {
  id: string;
  title: string;
  category: string;
  emergencyLevel: RiskLevel;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  updatedAt: string;
};

const categories = [
  "Bleeding",
  "Burns",
  "CPR",
  "Choking",
  "Fractures",
  "Neurological",
  "Poisoning",
  "Allergies",
  "Other",
];

const levels: { label: string; value: RiskLevel }[] = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Emergency", value: "EMERGENCY" },
];

export default function ReviewerContent() {
  const [category, setCategory] = useState("Bleeding");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<RiskLevel>("LOW");
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState("");
  const [tips, setTips] = useState<ManageTip[]>([]);
  const [title, setTitle] = useState("");
  const [warnings, setWarnings] = useState("");

  const loadTips = async () => {
    try {
      const { data } = await api.get<ManageTip[]>("/first-aid-tips/manage");
      setTips(data);
    } catch {
      setTips([]);
    }
  };

  useEffect(() => {
    loadTips();
  }, []);

  const submitTip = async () => {
    if (!title.trim() || !description.trim() || !steps.trim()) {
      Alert.alert(
        "Missing details",
        "Add a title, description, and at least one step.",
      );
      return;
    }

    setLoading(true);
    try {
      await api.post("/first-aid-tips", {
        category,
        description: description.trim(),
        emergencyLevel: level,
        isOfflineReady: true,
        steps: lines(steps),
        title: title.trim(),
        warnings: lines(warnings),
      });
      setTitle("");
      setDescription("");
      setSteps("");
      setWarnings("");
      setLevel("LOW");
      setCategory("Bleeding");
      await loadTips();
      Alert.alert(
        "Submitted for approval",
        "An admin must approve this first-aid guide before patients can see it.",
      );
    } catch (error) {
      Alert.alert("Could not submit", getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardScreen eyebrow="CLINICAL CONTENT" title="First-aid drafts">
      <Text style={dashboardStyles.sectionTitle}>Submit guide for admin approval</Text>
      <View style={dashboardStyles.card}>
        <Input
          label="Title"
          onChangeText={setTitle}
          placeholder="e.g. Severe nose bleeding"
          value={title}
        />
        <Input
          label="Description"
          multiline
          onChangeText={setDescription}
          placeholder="When should this guide be used?"
          value={description}
        />

        <Text style={styles.label}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
        >
          {categories.map((item) => (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[
                styles.chip,
                category === item && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  category === item && styles.chipTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.label}>Severity</Text>
        <View style={styles.levelGrid}>
          {levels.map((item) => (
            <Pressable
              key={item.value}
              onPress={() => setLevel(item.value)}
              style={[
                styles.levelButton,
                level === item.value && styles.levelButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.levelText,
                  level === item.value && styles.levelTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Input
          label="Steps"
          multiline
          onChangeText={setSteps}
          placeholder={"1. First step\n2. Second step"}
          value={steps}
        />
        <Input
          label="Warnings"
          multiline
          onChangeText={setWarnings}
          placeholder={"What should patients avoid?\nWhen should they seek urgent care?"}
          value={warnings}
        />

        <Pressable
          disabled={loading}
          onPress={submitTip}
          style={[dashboardStyles.button, loading && styles.disabledButton]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={dashboardStyles.buttonText}>SUBMIT FOR APPROVAL</Text>
          )}
        </Pressable>
      </View>

      <Text style={dashboardStyles.sectionTitle}>Your content queue</Text>
      {tips.map((item) => (
        <View key={item.id} style={dashboardStyles.card}>
          <View style={dashboardStyles.row}>
            <View style={dashboardStyles.grow}>
              <Text style={dashboardStyles.label}>
                {item.category.toUpperCase()} · {item.emergencyLevel}
              </Text>
              <Text style={dashboardStyles.heading}>{item.title}</Text>
              <Text numberOfLines={2} style={dashboardStyles.body}>
                {item.description}
              </Text>
            </View>
            <StatusBadge status={item.status} />
          </View>
        </View>
      ))}
      {!tips.length ? (
        <View style={dashboardStyles.card}>
          <Text style={dashboardStyles.body}>
            No first-aid drafts yet. Submit one and it will appear here.
          </Text>
        </View>
      ) : null}
    </DashboardScreen>
  );
}

function Input({
  label,
  multiline,
  ...props
}: ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        multiline={multiline}
        placeholderTextColor={COLORS.TEXT_LIGHT}
        style={[styles.input, multiline && styles.multilineInput]}
        textAlignVertical={multiline ? "top" : "center"}
        {...props}
      />
    </>
  );
}

function StatusBadge({ status }: { status: ManageTip["status"] }) {
  const color =
    status === "APPROVED"
      ? COLORS.SUCCESS
      : status === "REJECTED"
        ? COLORS.ERROR
        : COLORS.WARNING;
  return (
    <View style={[styles.statusBadge, { backgroundColor: `${color}18` }]}>
      <Ionicons
        color={color}
        name={
          status === "APPROVED"
            ? "checkmark-circle"
            : status === "REJECTED"
              ? "close-circle"
              : "time"
        }
        size={16}
      />
      <Text style={[styles.statusText, { color }]}>
        {status.toLowerCase()}
      </Text>
    </View>
  );
}

function lines(value: string) {
  return value
    .split(/\n+/)
    .map((line) => line.replace(/^\d+[.)]\s*/, "").trim())
    .filter(Boolean);
}

const styles = StyleSheet.create({
  label: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    borderColor: COLORS.BORDER,
    borderRadius: 6,
    borderWidth: 1,
    color: COLORS.TEXT_PRIMARY,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  multilineInput: {
    minHeight: 92,
    paddingTop: 11,
  },
  chipScroll: {
    marginBottom: 2,
  },
  chip: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
    borderRadius: 6,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipActive: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
  },
  chipText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: "800",
  },
  chipTextActive: {
    color: COLORS.PRIMARY_DARK,
  },
  levelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  levelButton: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  levelButtonActive: {
    backgroundColor: COLORS.PRIMARY_DARK,
  },
  levelText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: "800",
  },
  levelTextActive: {
    color: "#FFFFFF",
  },
  disabledButton: {
    opacity: 0.6,
  },
  statusBadge: {
    alignItems: "center",
    borderRadius: 6,
    flexDirection: "row",
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 4,
    textTransform: "uppercase",
  },
});
