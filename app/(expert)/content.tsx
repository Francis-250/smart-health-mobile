import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import {
  DashboardScreen,
  dashboardStyles,
} from "@/components/dashboard-ui";
import { COLORS } from "@/constants/colors";
import { usePlatformStore } from "@/stores/platform-store";

export default function ReviewerContent() {
  const { addContent, content, toggleContentStatus } = usePlatformStore();
  const [title, setTitle] = useState("");

  const addTip = () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Enter a first aid guide title.");
      return;
    }
    addContent(title.trim(), "first-aid");
    setTitle("");
  };

  return (
    <DashboardScreen eyebrow="CLINICAL CONTENT" title="Guides & Hospitals">
      <Text style={dashboardStyles.sectionTitle}>Create first aid draft</Text>
      <View style={dashboardStyles.card}>
        <TextInput
          onChangeText={setTitle}
          placeholder="Guide title"
          placeholderTextColor={COLORS.TEXT_LIGHT}
          style={{
            borderColor: COLORS.BORDER,
            borderRadius: 6,
            borderWidth: 1,
            color: COLORS.TEXT_PRIMARY,
            height: 46,
            paddingHorizontal: 12,
          }}
          value={title}
        />
        <Pressable
          onPress={addTip}
          style={[dashboardStyles.button, { marginTop: 10 }]}
        >
          <Text style={dashboardStyles.buttonText}>ADD DRAFT</Text>
        </Pressable>
      </View>

      <Text style={dashboardStyles.sectionTitle}>Managed content</Text>
      {content.map((item) => (
        <View key={item.id} style={dashboardStyles.card}>
          <View style={dashboardStyles.row}>
            <View style={dashboardStyles.grow}>
              <Text style={dashboardStyles.label}>
                {item.type.replace("-", " ").toUpperCase()}
              </Text>
              <Text style={dashboardStyles.heading}>{item.title}</Text>
              <Text style={dashboardStyles.body}>
                Updated {item.updatedAt} · {item.status}
              </Text>
            </View>
            <Pressable
              onPress={() => toggleContentStatus(item.id)}
              style={[
                dashboardStyles.button,
                item.status === "published" && dashboardStyles.mutedButton,
              ]}
            >
              <Text
                style={[
                  dashboardStyles.buttonText,
                  item.status === "published" &&
                    dashboardStyles.mutedButtonText,
                ]}
              >
                {item.status === "published" ? "UNPUBLISH" : "PUBLISH"}
              </Text>
            </Pressable>
          </View>
        </View>
      ))}
    </DashboardScreen>
  );
}
