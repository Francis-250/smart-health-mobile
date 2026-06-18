import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  AUTH_COLORS,
  AuthFormScreen,
  sharedStyles,
} from "@/components/auth-form";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const resetPassword = () => {
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    router.replace("/(auth)/login");
  };

  return (
    <AuthFormScreen
      icon="lock-closed"
      title="Reset password"
      subtitle="Choose a strong new password for your Smart Health account."
    >
      <PasswordField
        label="New password"
        onChangeText={setPassword}
        placeholder="Enter new password"
        show={showPassword}
        toggle={() => setShowPassword((current) => !current)}
        value={password}
      />
      <PasswordField
        label="Confirm password"
        onChangeText={setConfirmPassword}
        onSubmitEditing={resetPassword}
        placeholder="Repeat new password"
        returnKeyType="done"
        show={showPassword}
        toggle={() => setShowPassword((current) => !current)}
        value={confirmPassword}
      />

      {error ? <Text style={sharedStyles.error}>{error}</Text> : null}

      <Pressable
        onPress={resetPassword}
        style={({ pressed }) => [
          sharedStyles.button,
          pressed && sharedStyles.buttonPressed,
        ]}
      >
        <Text style={sharedStyles.buttonText}>RESET PASSWORD</Text>
        <Ionicons name="checkmark" size={21} color="#FFFFFF" />
      </Pressable>
    </AuthFormScreen>
  );
}

type PasswordFieldProps = React.ComponentProps<typeof TextInput> & {
  label: string;
  show: boolean;
  toggle: () => void;
};

function PasswordField({
  label,
  show,
  toggle,
  ...props
}: PasswordFieldProps) {
  return (
    <>
      <Text style={sharedStyles.label}>{label}</Text>
      <View style={sharedStyles.inputContainer}>
        <Ionicons
          name="lock-closed-outline"
          size={21}
          color={AUTH_COLORS.muted}
        />
        <TextInput
          autoCapitalize="none"
          placeholderTextColor="#8B9691"
          secureTextEntry={!show}
          style={sharedStyles.input}
          {...props}
        />
        <Pressable onPress={toggle} hitSlop={10}>
          <Ionicons
            name={show ? "eye-off-outline" : "eye-outline"}
            size={22}
            color={AUTH_COLORS.text}
          />
        </Pressable>
      </View>
    </>
  );
}
