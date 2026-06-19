import { Pressable, Text, View } from "react-native";
import {
  DashboardScreen,
  dashboardStyles,
} from "@/components/dashboard-ui";
import { COLORS } from "@/constants/colors";
import { usePlatformStore } from "@/stores/platform-store";

export default function ReviewerSchedule() {
  const { appointments, updateAppointment } = usePlatformStore();

  return (
    <DashboardScreen eyebrow="CARE SCHEDULE" title="Appointments">
      <Text style={dashboardStyles.sectionTitle}>Today</Text>
      {appointments.map((item) => (
        <View key={item.id} style={dashboardStyles.card}>
          <Text style={dashboardStyles.label}>{item.time}</Text>
          <Text style={dashboardStyles.heading}>{item.patientName}</Text>
          <Text style={dashboardStyles.body}>{item.reason}</Text>
          <View
            style={[
              dashboardStyles.row,
              { gap: 8, marginTop: 12 },
            ]}
          >
            <Pressable
              onPress={() => updateAppointment(item.id, "completed")}
              style={[dashboardStyles.button, { flex: 1 }]}
            >
              <Text style={dashboardStyles.buttonText}>COMPLETE</Text>
            </Pressable>
            <Pressable
              onPress={() => updateAppointment(item.id, "cancelled")}
              style={[
                dashboardStyles.button,
                dashboardStyles.mutedButton,
                { flex: 1 },
              ]}
            >
              <Text
                style={[
                  dashboardStyles.buttonText,
                  dashboardStyles.mutedButtonText,
                ]}
              >
                CANCEL
              </Text>
            </Pressable>
          </View>
          <Text
            style={{
              color:
                item.status === "completed" ? COLORS.SUCCESS : COLORS.WARNING,
              fontSize: 11,
              fontWeight: "900",
              marginTop: 10,
              textTransform: "uppercase",
            }}
          >
            {item.status}
          </Text>
        </View>
      ))}
    </DashboardScreen>
  );
}
