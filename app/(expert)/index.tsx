import { Text, View } from "react-native";
import {
  DashboardScreen,
  dashboardStyles,
  MetricCard,
} from "@/components/dashboard-ui";
import { COLORS } from "@/constants/colors";
import { usePlatformStore } from "@/stores/platform-store";

export default function ReviewerDashboard() {
  const { appointments, cases } = usePlatformStore();
  const pending = cases.filter((item) => item.status === "pending");
  const highRisk = cases.filter(
    (item) => item.riskLevel === "high" || item.riskLevel === "critical",
  );
  const reviewed = cases.filter((item) => item.status === "reviewed");

  return (
    <DashboardScreen eyebrow="MEDICAL REVIEWER" title="Clinical Dashboard">
      <View style={dashboardStyles.metrics}>
        <MetricCard
          color={COLORS.WARNING}
          icon="time"
          label="Pending reviews"
          value={pending.length}
        />
        <MetricCard
          color={COLORS.ERROR}
          icon="alert-circle"
          label="High-risk cases"
          value={highRisk.length}
        />
        <MetricCard
          color={COLORS.SUCCESS}
          icon="checkmark-circle"
          label="Reviewed"
          value={reviewed.length}
        />
        <MetricCard
          color={COLORS.INFO}
          icon="calendar"
          label="Today's visits"
          value={appointments.filter((item) => item.status === "scheduled").length}
        />
      </View>

      <Text style={dashboardStyles.sectionTitle}>Urgent attention</Text>
      {highRisk.map((item) => (
        <View key={item.id} style={dashboardStyles.card}>
          <Text style={[dashboardStyles.label, { color: COLORS.ERROR }]}>
            {item.riskLevel.toUpperCase()} · {item.riskScore}%
          </Text>
          <Text style={dashboardStyles.heading}>{item.patientName}</Text>
          <Text style={dashboardStyles.body}>{item.symptoms}</Text>
          <Text style={dashboardStyles.body}>
            Status: {item.status.replace("-", " ")}
          </Text>
        </View>
      ))}

      <Text style={dashboardStyles.sectionTitle}>Today’s schedule</Text>
      {appointments.map((item) => (
        <View key={item.id} style={dashboardStyles.card}>
          <View style={dashboardStyles.row}>
            <View style={dashboardStyles.grow}>
              <Text style={dashboardStyles.label}>{item.time}</Text>
              <Text style={dashboardStyles.heading}>{item.patientName}</Text>
              <Text style={dashboardStyles.body}>{item.reason}</Text>
            </View>
            <Text style={{ color: COLORS.PRIMARY, fontWeight: "800" }}>
              {item.status}
            </Text>
          </View>
        </View>
      ))}
    </DashboardScreen>
  );
}
