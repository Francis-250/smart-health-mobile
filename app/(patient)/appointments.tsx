import { Button, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNotifications } from "@/hooks/useNotifications";

export default function PatientAppointments() {
  const { sendLocalNotification, expoPushToken } = useNotifications();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Patient Appointments</Text>
        <Button
          title="Test Notification"
          onPress={() =>
            sendLocalNotification(
              "Test Notification 🔔",
              "Notification is working!",
              { screen: "appointments" },
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}
