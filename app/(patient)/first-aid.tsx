import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import {
  FIRST_AID_TIPS,
  FirstAidTip,
} from "@/constants/first-aid-tips";
import { api } from "@/lib/api";

const LEVEL_COLORS = {
  Low: COLORS.SUCCESS,
  Medium: COLORS.WARNING,
  High: "#D45600",
  Emergency: COLORS.ERROR,
};

export default function FirstAidLibrary() {
  const [query, setQuery] = useState("");
  const [selectedTip, setSelectedTip] = useState<FirstAidTip | null>(null);
  const [remoteTips, setRemoteTips] = useState<FirstAidTip[]>([]);

  useEffect(() => {
    api
      .get<
        {
          id: string;
          title: string;
          category: string;
          emergencyLevel: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
          description: string;
          steps: string[];
          warnings: string[];
        }[]
      >("/first-aid-tips")
      .then(({ data }) =>
        setRemoteTips(
          data.map((tip) => ({
            id: tip.id,
            title: tip.title,
            category: tip.category,
            emergencyLevel:
              tip.emergencyLevel === "EMERGENCY"
                ? "Emergency"
                : tip.emergencyLevel === "HIGH"
                  ? "High"
                  : tip.emergencyLevel === "MEDIUM"
                    ? "Medium"
                    : "Low",
            description: tip.description,
            steps: tip.steps,
            warnings: tip.warnings,
            keywords: [],
          })),
        ),
      )
      .catch(() => setRemoteTips([]));
  }, []);

  const tips = useMemo(() => {
    const source = remoteTips.length ? remoteTips : FIRST_AID_TIPS;
    const term = query.trim().toLowerCase();
    if (!term) return source;

    return source.filter((tip) =>
      [tip.title, tip.category, tip.description, ...tip.keywords]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [query, remoteTips]);

  if (selectedTip) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.detailContent}>
          <Pressable
            onPress={() => setSelectedTip(null)}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.backText}>All first aid guides</Text>
          </Pressable>

          <View
            style={[
              styles.levelBadge,
              { backgroundColor: LEVEL_COLORS[selectedTip.emergencyLevel] },
            ]}
          >
            <Text style={styles.levelText}>{selectedTip.emergencyLevel}</Text>
          </View>
          <Text style={styles.detailTitle}>{selectedTip.title}</Text>
          <Text style={styles.detailDescription}>
            {selectedTip.description}
          </Text>

          <Text style={styles.sectionHeading}>What to do</Text>
          {selectedTip.steps.map((step, index) => (
            <View key={step} style={styles.step}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          <View style={styles.warningCard}>
            <Text style={styles.warningHeading}>Important warnings</Text>
            {selectedTip.warnings.map((warning) => (
              <Text key={warning} style={styles.warningText}>
                • {warning}
              </Text>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>OFFLINE EMERGENCY GUIDES</Text>
        <Text style={styles.title}>First Aid Library</Text>
        <Text style={styles.subtitle}>
          Quick steps for common emergencies, available without internet.
        </Text>
      </View>

      <View style={styles.search}>
        <Ionicons name="search" size={20} color={COLORS.TEXT_LIGHT} />
        <TextInput
          onChangeText={setQuery}
          placeholder="Search burns, bleeding, CPR..."
          placeholderTextColor={COLORS.TEXT_LIGHT}
          style={styles.searchInput}
          value={query}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {tips.map((tip) => (
          <Pressable
            key={tip.id}
            onPress={() => setSelectedTip(tip)}
            style={({ pressed }) => [
              styles.tipCard,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.tipIcon,
                { backgroundColor: `${LEVEL_COLORS[tip.emergencyLevel]}18` },
              ]}
            >
              <Ionicons
                name="medical"
                size={23}
                color={LEVEL_COLORS[tip.emergencyLevel]}
              />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipCategory}>{tip.category}</Text>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text numberOfLines={2} style={styles.tipDescription}>
                {tip.description}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.TEXT_LIGHT}
            />
          </Pressable>
        ))}
        {!tips.length ? (
          <Text style={styles.emptyText}>No first aid guide matched.</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: COLORS.BACKGROUND, flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16 },
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
    marginTop: 5,
  },
  subtitle: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  search: {
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 17,
    paddingHorizontal: 13,
  },
  searchInput: {
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    height: 48,
    marginLeft: 8,
  },
  list: { padding: 20, paddingBottom: 32 },
  tipCard: {
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 11,
    padding: 13,
  },
  tipIcon: {
    alignItems: "center",
    borderRadius: 8,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  tipContent: { flex: 1, marginHorizontal: 12 },
  tipCategory: {
    color: COLORS.PRIMARY,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  tipTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 2,
  },
  tipDescription: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  pressed: { opacity: 0.75 },
  emptyText: {
    color: COLORS.TEXT_SECONDARY,
    marginTop: 30,
    textAlign: "center",
  },
  detailContent: { padding: 20, paddingBottom: 40 },
  backButton: { alignItems: "center", flexDirection: "row", marginBottom: 22 },
  backText: {
    color: COLORS.PRIMARY,
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 3,
  },
  levelBadge: {
    alignSelf: "flex-start",
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  levelText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  detailTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 29,
    fontWeight: "900",
    marginTop: 12,
  },
  detailDescription: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 7,
  },
  sectionHeading: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 12,
    marginTop: 26,
  },
  step: { alignItems: "flex-start", flexDirection: "row", marginBottom: 13 },
  stepNumber: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 13,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 26,
    marginRight: 11,
    textAlign: "center",
    width: 26,
  },
  stepText: {
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    paddingTop: 2,
  },
  warningCard: {
    backgroundColor: "#FFF1F0",
    borderRadius: 9,
    marginTop: 18,
    padding: 15,
  },
  warningHeading: { color: COLORS.ERROR, fontSize: 14, fontWeight: "900" },
  warningText: {
    color: "#8A2824",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
});
