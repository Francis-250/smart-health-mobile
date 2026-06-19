import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";

export default function Index() {
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);

  if (!hydrated) return null;

  if (user?.role === "expert") {
    return <Redirect href="/(expert)" />;
  }

  if (user?.role === "patient") {
    return <Redirect href="/(patient)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
