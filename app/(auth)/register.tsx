import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  AUTH_COLORS,
  AuthFormScreen,
  sharedStyles,
} from "@/components/auth-form";
import { useAuthStore } from "@/stores/auth-store";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const {
    error: apiError,
    loading,
    register: registerAccount,
  } = useAuthStore();

  const register = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const parts = name.trim().split(/\s+/);
    const user = await registerAccount({
      email: email.trim().toLowerCase(),
      password,
      firstName: parts[0],
      lastName: parts.slice(1).join(" ") || parts[0],
    });
    if (user) router.replace("/(patient)");
  };

  return (
    <AuthFormScreen
      icon="person-add"
      title="Create your account"
      subtitle="Join Smart Health and keep your care within reach."
      footer={
        <View style={sharedStyles.footer}>
          <Text style={sharedStyles.footerText}>Already have an account?</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable hitSlop={8}>
              <Text style={sharedStyles.footerLink}>Login</Text>
            </Pressable>
          </Link>
        </View>
      }
    >
      <AuthInput
        icon="person-outline"
        label="Full name"
        onChangeText={setName}
        placeholder="Your full name"
        value={name}
      />
      <AuthInput
        autoCapitalize="none"
        autoComplete="email"
        icon="mail-outline"
        keyboardType="email-address"
        label="Email"
        onChangeText={setEmail}
        placeholder="example@email.com"
        value={email}
      />
      <PasswordInput
        label="Password"
        onChangeText={setPassword}
        placeholder="Create a password"
        show={showPassword}
        toggle={() => setShowPassword((current) => !current)}
        value={password}
      />
      <PasswordInput
        label="Confirm password"
        onChangeText={setConfirmPassword}
        placeholder="Repeat your password"
        show={showPassword}
        toggle={() => setShowPassword((current) => !current)}
        value={confirmPassword}
      />

      {error || apiError ? (
        <Text style={sharedStyles.error}>{error || apiError}</Text>
      ) : null}

      <Pressable
        disabled={loading}
        onPress={register}
        style={({ pressed }) => [
          sharedStyles.button,
          pressed && sharedStyles.buttonPressed,
        ]}
      >
        <Text style={sharedStyles.buttonText}>
          {loading ? "CREATING..." : "REGISTER"}
        </Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </Pressable>
    </AuthFormScreen>
  );
}

type AuthInputProps = React.ComponentProps<typeof TextInput> & {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

function AuthInput({ icon, label, ...props }: AuthInputProps) {
  return (
    <>
      <Text style={sharedStyles.label}>{label}</Text>
      <View style={sharedStyles.inputContainer}>
        <Ionicons name={icon} size={21} color={AUTH_COLORS.muted} />
        <TextInput
          placeholderTextColor="#8B9691"
          style={sharedStyles.input}
          {...props}
        />
      </View>
    </>
  );
}

function PasswordInput({
  label,
  show,
  toggle,
  ...props
}: Omit<AuthInputProps, "icon"> & { show: boolean; toggle: () => void }) {
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
