import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  AUTH_COLORS,
  AuthFormScreen,
  sharedStyles,
} from "@/components/auth-form";
import { api, getApiError } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { email: email.trim().toLowerCase(), flow: "forgot" },
      });
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormScreen
      icon="key"
      title="Forgot password?"
      subtitle="Enter your email and we’ll send you a verification code."
    >
      <Text style={sharedStyles.label}>Email</Text>
      <View style={sharedStyles.inputContainer}>
        <Ionicons name="mail-outline" size={21} color={AUTH_COLORS.muted} />
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          onSubmitEditing={sendCode}
          placeholder="example@email.com"
          placeholderTextColor="#8B9691"
          returnKeyType="send"
          style={sharedStyles.input}
          value={email}
        />
      </View>

      {error ? <Text style={sharedStyles.error}>{error}</Text> : null}

      <Pressable
        disabled={loading}
        onPress={sendCode}
        style={({ pressed }) => [
          sharedStyles.button,
          pressed && sharedStyles.buttonPressed,
        ]}
      >
        <Text style={sharedStyles.buttonText}>
          {loading ? "SENDING..." : "SEND CODE"}
        </Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </Pressable>
    </AuthFormScreen>
  );
}
