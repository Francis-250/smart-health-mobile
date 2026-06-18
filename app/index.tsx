import { Link } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View>
        <Link href="/(auth)/login">
          <Text>Go to Login</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}
