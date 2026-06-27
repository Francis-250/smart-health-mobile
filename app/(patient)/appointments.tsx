import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { useNotifications } from "@/hooks/useNotifications";

export default function PatientAppointments() {
  const { expoPushToken, sendLocalNotification } = useNotifications();

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>CARE PLANNING</Text>
        <Text style={styles.title}>Appointments</Text>
        <Text style={styles.subtitle}>
          Keep follow-up visits and reminders in one place. Calendar booking will
          connect here once clinic scheduling is enabled.
        </Text>

        <View style={styles.card}>
          <View style={styles.iconBox}>
            <Ionicons name="calendar-outline" size={24} color={COLORS.PRIMARY} />
          </View>
          <Text style={styles.cardTitle}>No visits scheduled</Text>
          <Text style={styles.cardText}>
            If an assessment suggests follow-up care, save the appointment here
            and keep notifications enabled.
          </Text>
        </View>

        <Pressable
          onPress={() =>
            sendLocalNotification(
              "Smart Health reminder",
              "Notifications are ready for care reminders.",
              { screen: "appointments" },
            )
          }
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>SEND TEST REMINDER</Text>
          <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
        </Pressable>

        <Text selectable style={styles.tokenText}>
          {expoPushToken ?? "Preparing notification token…"}
        </Text>
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
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 24,
    padding: 16,
  },
  iconBox: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 6,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  cardTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 14,
  },
  cardText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  button: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_DARK,
    borderRadius: 6,
    flexDirection: "row",
    height: 50,
    justifyContent: "center",
    marginTop: 18,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginRight: 8,
  },
  pressed: { opacity: 0.8 },
  tokenText: {
    color: COLORS.TEXT_LIGHT,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 16,
  },
});
