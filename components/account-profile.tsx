import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store";
import { useEmergencyStore } from "@/stores/emergency-store";
import { useMedicalCardStore } from "@/stores/medical-card-store";

export function AccountProfile() {
  const { logout, user } = useAuthStore();
  const { contact, setContact } = useEmergencyStore();
  const [contactName, setContactName] = useState(contact.name);
  const [contactPhone, setContactPhone] = useState(contact.phone);
  const medicalCard = useMedicalCardStore();
  const [bloodGroup, setBloodGroup] = useState(medicalCard.bloodGroup);
  const [allergies, setAllergies] = useState(medicalCard.allergies);
  const [conditions, setConditions] = useState(medicalCard.conditions);
  const [medications, setMedications] = useState(medicalCard.medications);

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  const saveEmergencyContact = () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      Alert.alert("Missing details", "Enter a contact name and phone number.");
      return;
    }
    setContact({
      name: contactName.trim(),
      phone: contactPhone.trim(),
    });
    Alert.alert("Contact saved", "Your SOS contact has been updated.");
  };

  const saveMedicalCard = () => {
    medicalCard.updateMedicalCard({
      bloodGroup: bloodGroup.trim(),
      allergies: allergies.trim(),
      conditions: conditions.trim(),
      medications: medications.trim(),
    });
    Alert.alert("Medical card saved", "Your emergency information is secure.");
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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

        {user?.role === "patient" ? (
          <>
            <View style={styles.contactSection}>
              <Text style={styles.contactHeading}>Emergency medical card</Text>
              <Text style={styles.contactHelp}>
                Critical information that may help during an emergency.
              </Text>
              <TextInput
                autoCapitalize="characters"
                onChangeText={setBloodGroup}
                placeholder="Blood group, e.g. O+"
                placeholderTextColor={COLORS.TEXT_LIGHT}
                style={styles.input}
                value={bloodGroup}
              />
              <TextInput
                onChangeText={setAllergies}
                placeholder="Allergies"
                placeholderTextColor={COLORS.TEXT_LIGHT}
                style={styles.input}
                value={allergies}
              />
              <TextInput
                onChangeText={setConditions}
                placeholder="Medical conditions"
                placeholderTextColor={COLORS.TEXT_LIGHT}
                style={styles.input}
                value={conditions}
              />
              <TextInput
                onChangeText={setMedications}
                placeholder="Current medications"
                placeholderTextColor={COLORS.TEXT_LIGHT}
                style={styles.input}
                value={medications}
              />
              <Pressable
                onPress={saveMedicalCard}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.saveText}>SAVE MEDICAL CARD</Text>
              </Pressable>
            </View>

            <View style={styles.contactSection}>
              <Text style={styles.contactHeading}>Emergency contact</Text>
              <Text style={styles.contactHelp}>
                SOS opens a prefilled message to this person.
              </Text>
              <TextInput
                onChangeText={setContactName}
                placeholder="Contact name"
                placeholderTextColor={COLORS.TEXT_LIGHT}
                style={styles.input}
                value={contactName}
              />
              <TextInput
                keyboardType="phone-pad"
                onChangeText={setContactPhone}
                placeholder="Phone number with country code"
                placeholderTextColor={COLORS.TEXT_LIGHT}
                style={styles.input}
                value={contactPhone}
              />
              <Pressable
                onPress={saveEmergencyContact}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.saveText}>SAVE CONTACT</Text>
              </Pressable>
            </View>
          </>
        ) : null}

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
      </ScrollView>
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
    flexGrow: 1,
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
  contactSection: {
    marginTop: 28,
    width: "100%",
  },
  contactHeading: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: "800",
  },
  contactHelp: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    marginBottom: 10,
    marginTop: 3,
  },
  input: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.TEXT_PRIMARY,
    height: 48,
    marginTop: 9,
    paddingHorizontal: 13,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_DARK,
    borderRadius: 8,
    height: 46,
    justifyContent: "center",
    marginTop: 11,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  logoutButton: {
    alignItems: "center",
    backgroundColor: COLORS.ERROR,
    borderRadius: 8,
    flexDirection: "row",
    height: 54,
    justifyContent: "center",
    marginTop: 24,
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
