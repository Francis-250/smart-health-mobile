import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store";

export function AccountProfile() {
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={42} color={COLORS.PRIMARY} />
        </View>
        <Text style={styles.name}>{user?.name ?? "Smart Health User"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.role}>
            {user?.role === "expert" ? "DOCTOR" : "PATIENT"}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="log-out-outline" size={21} color="#FFFFFF" />
          <Text style={styles.logoutText}>LOGOUT</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
    paddingBottom: 70,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: 52,
    height: 104,
    justifyContent: "center",
    width: 104,
  },
  name: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 18,
  },
  email: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 15,
    marginTop: 5,
  },
  roleBadge: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: 6,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  role: {
    color: COLORS.PRIMARY_DARK,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  logoutButton: {
    alignItems: "center",
    backgroundColor: COLORS.ERROR,
    borderRadius: 8,
    flexDirection: "row",
    height: 54,
    justifyContent: "center",
    marginTop: 42,
    width: "100%",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.8,
  },
});
