import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { COLORS } from "@/constants/colors";

type TabIconProps = {
  color: string;
  focused: boolean;
  name: keyof typeof Ionicons.glyphMap;
  selectedName: keyof typeof Ionicons.glyphMap;
  size: number;
};

function TabIcon({
  color,
  focused,
  name,
  selectedName,
  size,
}: TabIconProps) {
  return (
    <Ionicons
      color={color}
      name={focused ? selectedName : name}
      size={size}
    />
  );
}

export default function PatientTabsLayout() {
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
            <TabIcon
              {...props}
              name="home-outline"
              selectedName="home"
            />
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
        name="doctors"
        options={{
          title: "Doctors",
          tabBarIcon: (props) => (
            <TabIcon
              {...props}
              name="medical-outline"
              selectedName="medical"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Visits",
          tabBarIcon: (props) => (
            <TabIcon
              {...props}
              name="calendar-outline"
              selectedName="calendar"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: (props) => (
            <TabIcon
              {...props}
              name="person-outline"
              selectedName="person"
            />
          ),
        }}
      />
    </Tabs>
  );
}
