import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  AUTH_COLORS,
  AuthFormScreen,
  sharedStyles,
} from "@/components/auth-form";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const sendCode = () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    router.push({
      pathname: "/(auth)/verify-otp",
      params: { email: email.trim(), flow: "forgot" },
    });
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
        onPress={sendCode}
        style={({ pressed }) => [
          sharedStyles.button,
          pressed && sharedStyles.buttonPressed,
        ]}
      >
        <Text style={sharedStyles.buttonText}>SEND CODE</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </Pressable>
    </AuthFormScreen>
  );
}
