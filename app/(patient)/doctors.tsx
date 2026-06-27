import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";

const careOptions = [
  {
    icon: "medkit-outline",
    title: "General clinician",
    text: "Review symptoms that are not urgent but still need medical advice.",
  },
  {
    icon: "bandage-outline",
    title: "Injury follow-up",
    text: "Check wounds, swelling, pain, or recovery after first aid.",
  },
  {
    icon: "heart-outline",
    title: "Urgent care",
    text: "Use hospitals or emergency services for severe or worsening symptoms.",
  },
] as const;

export default function Doctors() {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>CLINIC ACCESS</Text>
        <Text style={styles.title}>Find care</Text>
        <Text style={styles.subtitle}>
          Choose the kind of support you need. Booking can be connected to your
          clinic network when provider availability is ready.
        </Text>

        {careOptions.map((option) => (
          <Pressable key={option.title} style={styles.card}>
            <View style={styles.iconBox}>
              <Ionicons name={option.icon} size={22} color={COLORS.PRIMARY} />
            </View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>{option.title}</Text>
              <Text style={styles.cardText}>{option.text}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.TEXT_LIGHT} />
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: COLORS.BACKGROUND, flex: 1 },
  content: { flex: 1, padding: 20, paddingBottom: 80 },
  eyebrow: {
    color: COLORS.PRIMARY,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  title: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 27,
    fontWeight: "900",
    marginTop: 5,
  },
  subtitle: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  card: {
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 12,
    padding: 14,
  },
  iconBox: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 6,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  cardCopy: { flex: 1, marginHorizontal: 12 },
  cardTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: "900",
  },
  cardText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
});
