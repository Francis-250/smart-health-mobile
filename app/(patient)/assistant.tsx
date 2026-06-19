import { Ionicons } from "@expo/vector-icons";
import { requireOptionalNativeModule } from "expo";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import {
  HealthAssessment,
  RiskLevel,
  useHealthAssistantStore,
} from "@/stores/health-assistant-store";
import { useEmergencyStore } from "@/stores/emergency-store";

type SpeechResultEvent = {
  isFinal: boolean;
  results: { transcript?: string }[];
};

type SpeechErrorEvent = {
  error?: string;
  message?: string;
};

type SpeechRecognitionModule = {
  addListener: (
    event: "start" | "end" | "result" | "error",
    listener: (event: SpeechResultEvent & SpeechErrorEvent) => void,
  ) => { remove: () => void };
  isRecognitionAvailable: () => boolean;
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
  start: (options: {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
  }) => void;
  stop: () => void;
};

const speechRecognition =
  requireOptionalNativeModule<SpeechRecognitionModule>(
    "ExpoSpeechRecognition",
  );

export default function PatientAssistant() {
  const [message, setMessage] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [isListening, setIsListening] = useState(false);
  const lastTranscript = useRef("");
  const { messages, sendMessage } = useHealthAssistantStore();
  const contact = useEmergencyStore((state) => state.contact);

  useEffect(() => {
    if (!speechRecognition) return;

    const startSubscription = speechRecognition.addListener("start", () =>
      setIsListening(true),
    );
    const endSubscription = speechRecognition.addListener("end", () =>
      setIsListening(false),
    );
    const resultSubscription = speechRecognition.addListener(
      "result",
      (event) => {
        const transcript = event.results?.[0]?.transcript?.trim() ?? "";
        if (!transcript) return;
        setMessage(transcript);

        if (event.isFinal && transcript !== lastTranscript.current) {
          lastTranscript.current = transcript;
          const assessment = sendMessage(transcript);
          setMessage("");
          Speech.speak(assessment.summary, {
            language: "en-US",
            rate: 0.92,
          });
        }
      },
    );
    const errorSubscription = speechRecognition.addListener(
      "error",
      (event) => {
        setIsListening(false);
        if (event.error !== "aborted" && event.error !== "no-speech") {
          Alert.alert(
            "Voice recognition error",
            event.message ?? "Please try again.",
          );
        }
      },
    );

    return () => {
      startSubscription.remove();
      endSubscription.remove();
      resultSubscription.remove();
      errorSubscription.remove();
    };
  }, [sendMessage]);

  const pickFromLibrary = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Photo permission needed",
        "Allow photo access to attach an image for the health assistant.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Camera permission needed",
        "Allow camera access to photograph an injury.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      cameraType: ImagePicker.CameraType.back,
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const chooseImageSource = () => {
    Alert.alert("Add injury image", "Choose an image source.", [
      { text: "Camera", onPress: takePhoto },
      { text: "Photo library", onPress: pickFromLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const submit = () => {
    if (!message.trim() && !imageUri) return;
    const assessment = sendMessage(message, imageUri);
    Speech.speak(assessment.summary, { language: "en-US", rate: 0.92 });
    setMessage("");
    setImageUri(undefined);
  };

  const getLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Location permission needed",
        "Enable location to find nearby hospitals or include your position in an SOS.",
      );
      return null;
    }

    return Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  };

  const openNearbyHospitals = async () => {
    try {
      const location = await getLocation();
      if (!location) return;
      const { latitude, longitude } = location.coords;
      const query = encodeURIComponent(
        `hospitals near ${latitude},${longitude}`,
      );
      await Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${query}`,
      );
    } catch {
      Alert.alert(
        "Unable to open hospitals",
        "Check your location and internet connection, then try again.",
      );
    }
  };

  const sendSOS = () => {
    if (!contact.phone.trim()) {
      Alert.alert(
        "Add an emergency contact",
        "Open your Profile tab and save an emergency contact before using SOS.",
      );
      return;
    }

    Alert.alert(
      "Send SOS?",
      `This will prepare an emergency message for ${contact.name}. You must confirm sending it in your messaging app.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: async () => {
            try {
              const location = await getLocation();
              const locationText = location
                ? ` My location: https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`
                : "";
              const body = encodeURIComponent(
                `SOS: I may need urgent medical help. Please contact me and emergency services.${locationText}`,
              );
              const separator = Platform.OS === "ios" ? "&" : "?";
              await Linking.openURL(
                `sms:${contact.phone}${separator}body=${body}`,
              );
            } catch {
              Alert.alert(
                "SOS could not open",
                `Call ${contact.name} directly at ${contact.phone}.`,
              );
            }
          },
        },
      ],
    );
  };

  const toggleVoice = async () => {
    if (!speechRecognition) {
      Alert.alert(
        "Development build required",
        "Install the Smart Health development build to use live voice recognition.",
      );
      return;
    }

    if (isListening) {
      speechRecognition.stop();
      return;
    }

    if (!speechRecognition.isRecognitionAvailable()) {
      Alert.alert(
        "Voice unavailable",
        "Speech recognition is not available on this device.",
      );
      return;
    }
    const permission = await speechRecognition.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Microphone permission needed",
        "Allow microphone access to talk with Smart Health AI.",
      );
      return;
    }

    lastTranscript.current = "";
    Speech.stop();
    speechRecognition.start({
      continuous: false,
      interimResults: true,
      lang: "en-US",
    });
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 68 : 0}
        style={styles.keyboardView}
      >
        <View style={styles.notice}>
          <Ionicons
            name="information-circle"
            size={18}
            color={COLORS.SECONDARY_DARK}
          />
          <Text style={styles.noticeText}>
            General guidance only—not a diagnosis or emergency service.
          </Text>
        </View>

        <View style={styles.voicePanel}>
          <Pressable
            accessibilityLabel={
              isListening ? "Stop voice recording" : "Start voice chat"
            }
            onPress={toggleVoice}
            style={[
              styles.voiceButton,
              isListening && styles.voiceButtonListening,
            ]}
          >
            <Ionicons
              name={isListening ? "stop" : "mic"}
              size={30}
              color="#FFFFFF"
            />
          </Pressable>
          <View style={styles.voiceContent}>
            <Text style={styles.voiceTitle}>
              {isListening ? "Listening..." : "Talk with Smart Health AI"}
            </Text>
            <Text style={styles.voiceDescription}>
              {isListening
                ? "Speak naturally. Tap stop when you finish."
                : "Tap the microphone, ask your question, and hear the reply."}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.messagesList}
        >
          {messages.map((item) => (
            <View
              key={item.id}
              style={[
                styles.messageBubble,
                item.role === "user"
                  ? styles.userBubble
                  : styles.assistantBubble,
                item.assessment && styles.assessmentBubble,
              ]}
            >
              {item.imageUri ? (
                <Image
                  resizeMode="cover"
                  source={{ uri: item.imageUri }}
                  style={styles.messageImage}
                />
              ) : null}
              <Text
                style={[
                  styles.messageText,
                  item.role === "user" && styles.userText,
                ]}
              >
                {item.text}
              </Text>
              {item.assessment ? (
                <AssessmentCard
                  assessment={item.assessment}
                  onNearbyHospitals={openNearbyHospitals}
                  onSOS={sendSOS}
                />
              ) : null}
            </View>
          ))}
        </ScrollView>

        {imageUri ? (
          <View style={styles.previewRow}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <Text numberOfLines={1} style={styles.previewText}>
              Image ready to send
            </Text>
            <Pressable onPress={() => setImageUri(undefined)} hitSlop={8}>
              <Ionicons name="close-circle" size={22} color={COLORS.ERROR} />
            </Pressable>
          </View>
        ) : null}

        <View style={styles.composer}>
          <Pressable
            accessibilityLabel="Upload image"
            onPress={chooseImageSource}
            style={styles.attachButton}
          >
            <Ionicons name="image-outline" size={23} color={COLORS.PRIMARY} />
          </Pressable>
          <TextInput
            multiline
            onChangeText={setMessage}
            placeholder="Describe how you feel..."
            placeholderTextColor={COLORS.TEXT_LIGHT}
            style={styles.input}
            value={message}
          />
          <Pressable
            accessibilityLabel={
              isListening ? "Stop voice recording" : "Talk to AI"
            }
            onPress={toggleVoice}
            style={[
              styles.composerVoiceButton,
              isListening && styles.composerVoiceButtonListening,
            ]}
          >
            <Ionicons
              name={isListening ? "stop" : "mic"}
              size={20}
              color="#FFFFFF"
            />
          </Pressable>
          <Pressable
            accessibilityLabel="Send message"
            disabled={!message.trim() && !imageUri}
            onPress={submit}
            style={[
              styles.sendButton,
              !message.trim() && !imageUri && styles.sendDisabled,
            ]}
          >
            <Ionicons name="send" size={19} color="#FFFFFF" />
          </Pressable>
        </View>

        <Pressable
          accessibilityLabel="Send emergency SOS"
          onPress={sendSOS}
          style={({ pressed }) => [
            styles.sosButton,
            pressed && styles.sosPressed,
          ]}
        >
          <Ionicons name="alert-circle" size={21} color="#FFFFFF" />
          <Text style={styles.sosText}>SOS</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const RISK_COLORS: Record<RiskLevel, string> = {
  low: "#16803D",
  moderate: "#B77900",
  high: "#D45600",
  critical: "#C62828",
};

function AssessmentCard({
  assessment,
  onNearbyHospitals,
  onSOS,
}: {
  assessment: HealthAssessment;
  onNearbyHospitals: () => void;
  onSOS: () => void;
}) {
  const riskColor = RISK_COLORS[assessment.riskLevel];

  return (
    <View style={styles.assessment}>
      <View style={styles.riskRow}>
        <View style={[styles.riskBadge, { backgroundColor: riskColor }]}>
          <Text style={styles.riskBadgeText}>
            {assessment.riskLevel.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.riskScore, { color: riskColor }]}>
          Risk {assessment.riskScore}/100
        </Text>
      </View>

      <Text style={styles.assessmentHeading}>First aid now</Text>
      {assessment.firstAidSteps.map((step, index) => (
        <View key={step} style={styles.stepRow}>
          <Text style={styles.stepNumber}>{index + 1}</Text>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}

      <Text style={styles.assessmentHeading}>Get help immediately if</Text>
      {assessment.warningSigns.map((sign) => (
        <Text key={sign} style={styles.warningText}>
          • {sign}
        </Text>
      ))}

      {assessment.needsNearbyCare ? (
        <View style={styles.assessmentActions}>
          <Pressable
            onPress={onNearbyHospitals}
            style={styles.hospitalButton}
          >
            <Ionicons name="navigate" size={17} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Nearby hospitals</Text>
          </Pressable>
          <Pressable onPress={onSOS} style={styles.assessmentSosButton}>
            <Ionicons name="alert" size={17} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>SOS</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  notice: {
    alignItems: "center",
    backgroundColor: "#FFF7DF",
    borderRadius: 8,
    flexDirection: "row",
    marginHorizontal: 18,
    marginTop: 8,
    padding: 10,
  },
  noticeText: {
    color: COLORS.SECONDARY_DARK,
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    marginLeft: 7,
  },
  voicePanel: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: 10,
    flexDirection: "row",
    marginHorizontal: 18,
    marginTop: 12,
    padding: 12,
  },
  voiceButton: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  voiceButtonListening: {
    backgroundColor: COLORS.ERROR,
  },
  voiceContent: {
    flex: 1,
    marginLeft: 13,
  },
  voiceTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: "800",
  },
  voiceDescription: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  messages: {
    padding: 18,
    paddingBottom: 12,
  },
  messagesList: {
    flex: 1,
  },
  messageBubble: {
    borderRadius: 8,
    marginBottom: 12,
    maxWidth: "86%",
    padding: 12,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderColor: COLORS.BORDER_LIGHT,
    borderWidth: 1,
  },
  assessmentBubble: {
    maxWidth: "96%",
    width: "96%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.PRIMARY_DARK,
  },
  messageText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: "#FFFFFF",
  },
  messageImage: {
    borderRadius: 6,
    height: 150,
    marginBottom: 9,
    width: 210,
  },
  assessment: {
    borderTopColor: COLORS.BORDER_LIGHT,
    borderTopWidth: 1,
    marginTop: 11,
    paddingTop: 11,
  },
  riskRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  riskBadge: {
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  riskBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  riskScore: {
    fontSize: 13,
    fontWeight: "900",
  },
  assessmentHeading: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
    marginTop: 13,
  },
  stepRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    marginBottom: 7,
  },
  stepNumber: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: 10,
    color: COLORS.PRIMARY_DARK,
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 20,
    marginRight: 7,
    textAlign: "center",
    width: 20,
  },
  stepText: {
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  warningText: {
    color: COLORS.ERROR,
    fontSize: 12,
    lineHeight: 18,
  },
  assessmentActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 13,
  },
  hospitalButton: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_DARK,
    borderRadius: 7,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
  },
  assessmentSosButton: {
    alignItems: "center",
    backgroundColor: COLORS.ERROR,
    borderRadius: 7,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 5,
  },
  previewRow: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    flexDirection: "row",
    marginHorizontal: 14,
    padding: 8,
  },
  previewImage: {
    borderRadius: 5,
    height: 42,
    width: 42,
  },
  previewText: {
    color: COLORS.PRIMARY_DARK,
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    marginHorizontal: 9,
  },
  composer: {
    alignItems: "flex-end",
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderTopColor: COLORS.BORDER_LIGHT,
    borderTopWidth: 1,
    flexDirection: "row",
    marginBottom: 8,
    marginHorizontal: 10,
    padding: 8,
    borderRadius: 10,
    flexShrink: 0,
  },
  attachButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 42,
  },
  input: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
    borderRadius: 8,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  composerVoiceButton: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_DARK,
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    marginLeft: 8,
    width: 44,
  },
  composerVoiceButtonListening: {
    backgroundColor: COLORS.ERROR,
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    marginLeft: 8,
    width: 44,
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sosButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: COLORS.ERROR,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
    minHeight: 42,
    width: 110,
  },
  sosPressed: {
    opacity: 0.78,
  },
  sosText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
    marginLeft: 6,
  },
});
