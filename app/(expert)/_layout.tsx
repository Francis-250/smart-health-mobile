import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { COLORS } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store";

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
  const { hydrated, user } = useAuthStore();
  if (!hydrated) return null;
  if (user?.role !== "expert") return <Redirect href="/(auth)/login" />;

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
          title: "Reviews",
          tabBarIcon: ({ color, focused, size }) =>
            icon("people-outline", "people", color, focused, size),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          href: null,
          tabBarIcon: ({ color, focused, size }) =>
            icon("calendar-outline", "calendar", color, focused, size),
        }}
      />
      <Tabs.Screen
        name="content"
        options={{
          title: "Content",
          tabBarIcon: ({ color, focused, size }) =>
            icon("book-outline", "book", color, focused, size),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, focused, size }) =>
            icon("bar-chart-outline", "bar-chart", color, focused, size),
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
