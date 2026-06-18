import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  AUTH_COLORS,
  AuthFormScreen,
  sharedStyles,
} from "@/components/auth-form";

export default function VerifyOtp() {
  const { email = "", flow = "register" } = useLocalSearchParams<{
    email?: string;
    flow?: "register" | "forgot";
  }>();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(TextInput | null)[]>([]);

  const updateDigit = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < inputs.current.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const verify = () => {
    if (digits.some((digit) => !digit)) return;

    if (flow === "forgot") {
      router.replace({
        pathname: "/(auth)/reset-password",
        params: { email },
      });
      return;
    }

    router.replace("/(auth)/login");
  };

  return (
    <AuthFormScreen
      icon="chatbox-ellipses"
      title="Verify your code"
      subtitle={`Enter the 6-digit code sent to ${email || "your email"}.`}
    >
      <View style={styles.otpRow}>
        {digits.map((digit, index) => (
          <TextInput
            accessibilityLabel={`Digit ${index + 1}`}
            key={index}
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={(value) => updateDigit(value, index)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
                inputs.current[index - 1]?.focus();
              }
            }}
            ref={(input) => {
              inputs.current[index] = input;
            }}
            selectTextOnFocus
            style={styles.otpInput}
            value={digit}
          />
        ))}
      </View>

      <Pressable
        disabled={digits.some((digit) => !digit)}
        onPress={verify}
        style={({ pressed }) => [
          sharedStyles.button,
          digits.some((digit) => !digit) && styles.disabledButton,
          pressed && sharedStyles.buttonPressed,
        ]}
      >
        <Text style={sharedStyles.buttonText}>VERIFY CODE</Text>
        <Ionicons name="checkmark" size={21} color="#FFFFFF" />
      </Pressable>

      <View style={sharedStyles.footer}>
        <Text style={sharedStyles.footerText}>Didn’t receive the code?</Text>
        <Pressable hitSlop={8}>
          <Text style={sharedStyles.footerLink}>Resend</Text>
        </Pressable>
      </View>
    </AuthFormScreen>
  );
}

const styles = StyleSheet.create({
  otpRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: 16,
  },
  otpInput: {
    backgroundColor: AUTH_COLORS.surface,
    borderColor: AUTH_COLORS.border,
    borderRadius: 8,
    borderWidth: 1.5,
    color: AUTH_COLORS.text,
    fontSize: 22,
    fontWeight: "700",
    height: 58,
    textAlign: "center",
    width: 44,
  },
  disabledButton: {
    opacity: 0.45,
  },
});
