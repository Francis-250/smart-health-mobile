import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { COLORS } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store";

type TabIconProps = {
  color: string;
  focused: boolean;
  name: keyof typeof Ionicons.glyphMap;
  selectedName: keyof typeof Ionicons.glyphMap;
  size: number;
};

function TabIcon({ color, focused, name, selectedName, size }: TabIconProps) {
  return (
    <Ionicons color={color} name={focused ? selectedName : name} size={size} />
  );
}

export default function PatientTabsLayout() {
  const { hydrated, user } = useAuthStore();
  if (!hydrated) return null;
  if (user?.role !== "patient") return <Redirect href="/(auth)/login" />;

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
          title: "Home",
          tabBarIcon: (props) => (
            <TabIcon {...props} name="home-outline" selectedName="home" />
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "AI Assistant",
          tabBarIcon: (props) => (
            <TabIcon
              {...props}
              name="sparkles-outline"
              selectedName="sparkles"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="first-aid"
        options={{
          title: "First Aid",
          tabBarIcon: (props) => (
            <TabIcon {...props} name="book-outline" selectedName="book" />
          ),
        }}
      />
      <Tabs.Screen
        name="hospitals"
        options={{
          title: "Hospitals",
          tabBarIcon: (props) => (
            <TabIcon
              {...props}
              name="location-outline"
              selectedName="location"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: (props) => (
            <TabIcon {...props} name="person-outline" selectedName="person" />
          ),
        }}
      />
      <Tabs.Screen name="doctors" options={{ href: null }} />
      <Tabs.Screen name="appointments" options={{ href: null }} />
    </Tabs>
  );
}
