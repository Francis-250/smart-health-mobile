import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { COLORS } from "@/constants/colors";

type IconName = keyof typeof Ionicons.glyphMap;

function icon(
  outline: IconName,
  filled: IconName,
  color: string,
  focused: boolean,
  size: number,
) {
  return (
    <Ionicons
      color={color}
      name={focused ? filled : outline}
      size={size}
    />
  );
}

export default function ExpertTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT_LIGHT,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: COLORS.BACKGROUND_LIGHT,
          borderTopColor: COLORS.BORDER_LIGHT,
          height: 68,
          paddingTop: 7,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused, size }) =>
            icon("grid-outline", "grid", color, focused, size),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: "Patients",
          tabBarIcon: ({ color, focused, size }) =>
            icon("people-outline", "people", color, focused, size),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color, focused, size }) =>
            icon("calendar-outline", "calendar", color, focused, size),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused, size }) =>
            icon("person-outline", "person", color, focused, size),
        }}
      />
    </Tabs>
  );
}
