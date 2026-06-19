import { Text, View } from "react-native";
import {
  DashboardScreen,
  dashboardStyles,
  MetricCard,
} from "@/components/dashboard-ui";
import { COLORS } from "@/constants/colors";
import { usePlatformStore } from "@/stores/platform-store";

export default function ReviewerReports() {
  const cases = usePlatformStore((state) => state.cases);
  const average = Math.round(
    cases.reduce((total, item) => total + item.riskScore, 0) / cases.length,
  );
  const levels = ["critical", "high", "moderate", "low"] as const;

  return (
    <DashboardScreen eyebrow="CLINICAL REPORTING" title="Reports">
      <View style={dashboardStyles.metrics}>
        <MetricCard
          color={COLORS.INFO}
          icon="document-text"
          label="Assessments"
          value={cases.length}
        />
        <MetricCard
          color={COLORS.WARNING}
          icon="analytics"
          label="Average risk"
          value={`${average}%`}
        />
      </View>
      <Text style={dashboardStyles.sectionTitle}>Risk distribution</Text>
      {levels.map((level) => {
        const count = cases.filter((item) => item.riskLevel === level).length;
        const percentage = Math.round((count / cases.length) * 100);
        return (
          <View key={level} style={dashboardStyles.card}>
            <View style={dashboardStyles.row}>
              <Text style={[dashboardStyles.heading, dashboardStyles.grow]}>
                {level.toUpperCase()}
              </Text>
              <Text style={dashboardStyles.heading}>{count}</Text>
            </View>
            <View
              style={{
                backgroundColor: COLORS.BACKGROUND_GRAY,
                borderRadius: 4,
                height: 8,
                marginTop: 10,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  backgroundColor:
                    level === "critical" || level === "high"
                      ? COLORS.ERROR
                      : level === "moderate"
                        ? COLORS.WARNING
                        : COLORS.SUCCESS,
                  height: "100%",
                  width: `${percentage}%`,
                }}
              />
            </View>
          </View>
        );
      })}
    </DashboardScreen>
  );
}
