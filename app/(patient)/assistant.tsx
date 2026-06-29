import { Ionicons } from "@expo/vector-icons";
import { requireOptionalNativeModule } from "expo";
import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
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

type SpeechEvent = {
  error?: string;
  isFinal?: boolean;
  message?: string;
  results?: { transcript?: string }[];
};

type SpeechPermission = {
  canAskAgain: boolean;
  granted: boolean;
  status?: string;
};

type SpeechRecognitionModule = {
  addListener: (
    event: "start" | "end" | "result" | "error",
    listener: (event: SpeechEvent) => void,
  ) => { remove: () => void };
  getPermissionsAsync: () => Promise<SpeechPermission>;
  isRecognitionAvailable: () => boolean;
  requestPermissionsAsync: () => Promise<SpeechPermission>;
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

const RISK_COLORS: Record<RiskLevel, string> = {
  low: COLORS.SUCCESS,
  moderate: COLORS.WARNING,
  high: "#C35A00",
  critical: COLORS.ERROR,
};

export default function PatientAssistant() {
  const [message, setMessage] = useState("");
  const [imageUri, setImageUri] = useState<string>();
  const [isListening, setIsListening] = useState(false);
  const [permission, setPermission] = useState<SpeechPermission | null>(null);
  const [showPermission, setShowPermission] = useState(false);
  const [openAssessments, setOpenAssessments] = useState<
    Record<string, boolean>
  >({});
  const scrollRef = useRef<ScrollView>(null);
  const lastTranscript = useRef("");
  const { clearConversation, clearError, error, loading, messages, sendMessage } =
    useHealthAssistantStore();
  const contact = useEmergencyStore((state) => state.contact);

  const readAloud = useCallback((text: string) => {
    Speech.stop();
    Speech.speak(text, { language: "en-US", rate: 0.92 });
  }, []);

  const sendToAssistant = useCallback(
    async (text: string, image?: string) => {
      await sendMessage(text, image);
      setMessage("");
      setImageUri(undefined);
    },
    [sendMessage],
  );

  useEffect(() => {
    if (!speechRecognition) return;

    speechRecognition.getPermissionsAsync().then(setPermission);
    const subscriptions = [
      speechRecognition.addListener("start", () => setIsListening(true)),
      speechRecognition.addListener("end", () => setIsListening(false)),
      speechRecognition.addListener("result", (event) => {
        const transcript = event.results?.[0]?.transcript?.trim() ?? "";
        if (!transcript) return;
        setMessage(transcript);

        if (event.isFinal && transcript !== lastTranscript.current) {
          lastTranscript.current = transcript;
          sendToAssistant(transcript);
        }
      }),
      speechRecognition.addListener("error", (event) => {
        setIsListening(false);
        if (event.error !== "aborted" && event.error !== "no-speech") {
          Alert.alert("Voice problem", event.message ?? "Please try again.");
        }
      }),
    ];

    return () => subscriptions.forEach((item) => item.remove());
  }, [sendToAssistant]);

  useEffect(() => {
    requestAnimationFrame(() =>
      scrollRef.current?.scrollToEnd({ animated: true }),
    );
  }, [messages.length, imageUri]);

  const submit = () => {
    if (!message.trim() && !imageUri) return;
    sendToAssistant(message, imageUri);
  };

  const askQuickQuestion = (text: string) => {
    setMessage(text);
    sendToAssistant(text);
  };

  const beginVoice = () => {
    lastTranscript.current = "";
    Speech.stop();
    speechRecognition?.start({
      continuous: false,
      interimResults: true,
      lang: "en-US",
    });
  };

  const enableVoice = async () => {
    if (!speechRecognition) {
      Alert.alert(
        "Voice input unavailable",
        "This installed build cannot use the microphone. You can still type, upload a photo, and tap the speaker icon to hear AI replies.",
      );
      return;
    }

    const recordingPermission = await requestRecordingPermissionsAsync();
    if (!recordingPermission.granted) {
      setPermission({
        canAskAgain: recordingPermission.canAskAgain,
        granted: false,
        status: recordingPermission.status,
      });
      if (!recordingPermission.canAskAgain) {
        Alert.alert(
          "Microphone blocked",
          "Microphone access is blocked for Smart Health. Open phone settings and allow Microphone.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open settings", onPress: () => Linking.openSettings() },
          ],
        );
      }
      return;
    }

    if (permission && !permission.canAskAgain) {
      await Linking.openSettings();
      return;
    }

    const nextPermission = await speechRecognition.requestPermissionsAsync();
    setPermission(nextPermission);
    if (nextPermission.granted) {
      setShowPermission(false);
      beginVoice();
      return;
    }

    if (!nextPermission.canAskAgain) {
      Alert.alert(
        "Speech recognition blocked",
        "Open phone settings and allow speech recognition/microphone for Smart Health.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open settings", onPress: () => Linking.openSettings() },
        ],
      );
    }
  };

  const toggleVoice = async () => {
    if (!speechRecognition) {
      Alert.alert(
        "Voice input unavailable",
        "This installed build cannot use the microphone. Type your problem or upload a photo, then tap the speaker icon on an AI reply if you want it read aloud.",
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
        "Speech recognition is unavailable on this device.",
      );
      return;
    }

    let recordingPermission = await getRecordingPermissionsAsync();
    if (!recordingPermission.granted) {
      recordingPermission = await requestRecordingPermissionsAsync();
    }

    if (!recordingPermission.granted) {
      setPermission({
        canAskAgain: recordingPermission.canAskAgain,
        granted: false,
        status: recordingPermission.status,
      });
      if (recordingPermission.canAskAgain) {
        setShowPermission(true);
      } else {
        Alert.alert(
          "Microphone blocked",
          "Microphone access is blocked for Smart Health. Open phone settings and allow Microphone.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open settings", onPress: () => Linking.openSettings() },
          ],
        );
      }
      return;
    }

    const currentPermission =
      permission ?? (await speechRecognition.getPermissionsAsync());
    setPermission(currentPermission);
    if (!currentPermission.granted) {
      const nextPermission = await speechRecognition.requestPermissionsAsync();
      setPermission(nextPermission);
      if (!nextPermission.granted) {
        if (nextPermission.canAskAgain) {
          setShowPermission(true);
        } else {
          Alert.alert(
            "Speech recognition blocked",
            "Open phone settings and allow speech recognition/microphone for Smart Health.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open settings", onPress: () => Linking.openSettings() },
            ],
          );
        }
        return;
      }
      beginVoice();
      return;
    }
    beginVoice();
  };

  const pickImage = async (camera: boolean) => {
    const access = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!access.granted) {
      Alert.alert(
        "Permission needed",
        `Allow ${camera ? "camera" : "photo"} access to share an injury image.`,
      );
      return;
    }

    const result = camera
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          cameraType: ImagePicker.CameraType.back,
          quality: 0.45,
        })
      : await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          mediaTypes: ["images"],
          quality: 0.45,
        });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const chooseImage = () => {
    Alert.alert("Share an injury image", "Choose where to get the image.", [
      { text: "Take photo", onPress: () => pickImage(true) },
      { text: "Choose photo", onPress: () => pickImage(false) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const getLocation = async () => {
    const access = await Location.requestForegroundPermissionsAsync();
    if (!access.granted) {
      Alert.alert(
        "Location needed",
        "Allow location to find hospitals or include your position in SOS.",
      );
      return null;
    }
    return Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  };

  const openNearbyHospitals = async () => {
    const location = await getLocation();
    if (!location) return;
    const { latitude, longitude } = location.coords;
    const query = encodeURIComponent(`hospitals near ${latitude},${longitude}`);
    await Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
    );
  };

  const sendSOS = () => {
    if (!contact.phone.trim()) {
      Alert.alert(
        "Emergency contact missing",
        "Add an emergency contact in Profile before using SOS.",
      );
      return;
    }
    Alert.alert("Send SOS?", `Prepare an emergency message for ${contact.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Continue",
        style: "destructive",
        onPress: async () => {
          const location = await getLocation();
          const mapLink = location
            ? ` Location: https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`
            : "";
          const body = encodeURIComponent(
            `SOS: I may need urgent medical help. Please contact me.${mapLink}`,
          );
          const separator = Platform.OS === "ios" ? "&" : "?";
          await Linking.openURL(
            `sms:${contact.phone}${separator}body=${body}`,
          );
        },
      },
    ]);
  };

  const toggleAssessment = (messageId: string) => {
    setOpenAssessments((current) => ({
      ...current,
      [messageId]: !current[messageId],
    }));
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <VoicePermissionSheet
        canAskAgain={permission?.canAskAgain ?? true}
        onClose={() => setShowPermission(false)}
        onEnable={enableVoice}
        visible={showPermission}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <View style={styles.aiIdentity}>
            <View style={styles.aiMark}>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.title}>Smart Health AI</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Ready to help</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityLabel="Clear conversation"
              onPress={clearConversation}
              style={styles.headerIconButton}
            >
              <Ionicons name="refresh" size={19} color={COLORS.TEXT_SECONDARY} />
            </Pressable>
            <Pressable onPress={sendSOS} style={styles.sosButton}>
              <Text style={styles.sosButtonText}>SOS</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.voiceBar}>
          <Pressable
            accessibilityLabel={isListening ? "Stop listening" : "Start voice"}
            onPress={toggleVoice}
            style={[
              styles.voiceButton,
              isListening && styles.voiceButtonActive,
            ]}
          >
            <Ionicons
              name={isListening ? "stop" : "mic"}
              size={23}
              color="#FFFFFF"
            />
          </Pressable>
          <View style={styles.voiceText}>
            <Text style={styles.voiceTitle}>
              {isListening ? "I’m listening…" : "Talk when you choose"}
            </Text>
            <Text style={styles.voiceSubtitle}>
              {isListening
                ? "Say the problem like you are talking to a nurse."
                : "Tap mic to speak if available. Tap speaker on any AI answer to read it."}
            </Text>
          </View>
          {isListening ? (
            <View style={styles.listeningBadge}>
              <Text style={styles.listeningText}>LIVE</Text>
            </View>
          ) : null}
        </View>

        <ScrollView
          contentContainerStyle={styles.messageList}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          style={styles.messageScroller}
        >
          <View style={styles.safetyNote}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.INFO} />
            <Text style={styles.safetyText}>
              General first-aid guidance—not a medical diagnosis.
            </Text>
          </View>

          {messages.length <= 1 ? (
            <View style={styles.conversationStarter}>
              <Text style={styles.starterEyebrow}>START A ONE-TO-ONE CHECK</Text>
              <Text style={styles.starterTitle}>
                Tell me what you feel, where it hurts, and when it started.
              </Text>
              <View style={styles.starterGrid}>
                <StarterChip
                  icon="thermometer-outline"
                  label="I have fever"
                  onPress={() =>
                    askQuickQuestion(
                      "I have a fever. Please ask me what you need to know and tell me what first aid I should do.",
                    )
                  }
                />
                <StarterChip
                  icon="bandage-outline"
                  label="I’m injured"
                  onPress={() =>
                    askQuickQuestion(
                      "I have an injury. Please guide me step by step and ask follow-up questions if needed.",
                    )
                  }
                />
                <StarterChip
                  icon="pulse-outline"
                  label="Chest pain"
                  onPress={() =>
                    askQuickQuestion(
                      "I have chest pain. Please help me understand what to do now.",
                    )
                  }
                />
                <StarterChip
                  icon="camera-outline"
                  label="Upload photo"
                  onPress={chooseImage}
                />
              </View>
            </View>
          ) : null}

          {messages.map((item) => (
            <View
              key={item.id}
              style={[
                styles.message,
                item.role === "user" ? styles.userMessage : styles.aiMessage,
                item.assessment && styles.assessmentMessage,
              ]}
            >
              {item.role === "assistant" ? (
                <View style={styles.messageAuthor}>
                  <View style={styles.authorLeft}>
                    <View style={styles.miniAiMark}>
                      <Ionicons name="sparkles" size={11} color="#FFFFFF" />
                    </View>
                    <Text style={styles.messageAuthorText}>SMART HEALTH AI</Text>
                  </View>
                  <Pressable
                    accessibilityLabel="Read AI reply aloud"
                    onPress={() => readAloud(item.text)}
                    style={styles.readButton}
                  >
                    <Ionicons
                      name="volume-high-outline"
                      size={15}
                      color={COLORS.PRIMARY}
                    />
                    <Text style={styles.readButtonText}>Read</Text>
                  </Pressable>
                </View>
              ) : null}
              {item.imageUri ? (
                <Image source={{ uri: item.imageUri }} style={styles.image} />
              ) : null}
              <Text
                style={[
                  styles.messageText,
                  item.role === "user" && styles.userMessageText,
                ]}
              >
                {item.text}
              </Text>
              {item.assessment ? (
                <AssessmentResult
                  assessment={item.assessment}
                  expanded={
                    openAssessments[item.id] ??
                    item.assessment.riskLevel === "critical"
                  }
                  onToggle={() => toggleAssessment(item.id)}
                  onHospitals={openNearbyHospitals}
                  onSOS={sendSOS}
                />
              ) : null}
            </View>
          ))}
        </ScrollView>

        {imageUri ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <View style={styles.previewCopy}>
              <Text style={styles.previewTitle}>Injury photo attached</Text>
              <Text style={styles.previewSubtitle}>Add details, then send.</Text>
            </View>
            <Pressable
              accessibilityLabel="Remove image"
              onPress={() => setImageUri(undefined)}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.TEXT_LIGHT} />
            </Pressable>
          </View>
        ) : null}

        {error ? (
          <Pressable onPress={clearError} style={styles.errorBanner}>
            <Ionicons name="cloud-offline-outline" size={18} color={COLORS.ERROR} />
            <Text style={styles.errorBannerText}>{error}</Text>
            <Ionicons name="close" size={18} color={COLORS.TEXT_LIGHT} />
          </Pressable>
        ) : null}

        <View style={styles.composer}>
          <Pressable
            accessibilityLabel="Add injury image"
            disabled={loading}
            onPress={chooseImage}
            style={styles.composerAction}
          >
            <Ionicons name="camera-outline" size={22} color={COLORS.PRIMARY} />
          </Pressable>
          <TextInput
            multiline
            onChangeText={setMessage}
            placeholder="Describe symptoms or ask a question"
            placeholderTextColor={COLORS.TEXT_LIGHT}
            style={styles.input}
            value={message}
            editable={!loading}
          />
          <Pressable
            accessibilityLabel={isListening ? "Stop listening" : "Use voice"}
            disabled={loading}
            onPress={toggleVoice}
            style={[
              styles.composerAction,
              isListening && styles.composerMicActive,
            ]}
          >
            <Ionicons
              name={isListening ? "stop" : "mic-outline"}
              size={22}
              color={isListening ? "#FFFFFF" : COLORS.PRIMARY}
            />
          </Pressable>
          <Pressable
            accessibilityLabel="Send"
            disabled={loading || (!message.trim() && !imageUri)}
            onPress={submit}
            style={[
              styles.sendButton,
              (loading || (!message.trim() && !imageUri)) &&
                styles.sendButtonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="arrow-up" size={22} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StarterChip({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.starterChip}>
      <Ionicons name={icon} size={18} color={COLORS.PRIMARY} />
      <Text style={styles.starterChipText}>{label}</Text>
    </Pressable>
  );
}

function AssessmentResult({
  assessment,
  expanded,
  onToggle,
  onHospitals,
  onSOS,
}: {
  assessment: HealthAssessment;
  expanded: boolean;
  onToggle: () => void;
  onHospitals: () => void;
  onSOS: () => void;
}) {
  const color = RISK_COLORS[assessment.riskLevel];

  return (
    <View style={styles.assessment}>
      <Pressable onPress={onToggle} style={styles.assessmentHeader}>
        <View>
          <Text style={styles.assessmentLabel}>PRELIMINARY RISK</Text>
          <Text style={[styles.assessmentLevel, { color }]}>
            {assessment.riskLevel.toUpperCase()}
          </Text>
        </View>
        <View style={styles.assessmentRight}>
          <View style={[styles.scoreCircle, { borderColor: color }]}>
            <Text style={[styles.scoreText, { color }]}>
              {assessment.riskScore}
            </Text>
            <Text style={[styles.scoreUnit, { color }]}>/100</Text>
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={COLORS.TEXT_LIGHT}
          />
        </View>
      </Pressable>

      <Text style={styles.assessmentHint}>
        Tap to {expanded ? "hide" : "see"} first-aid steps and warning signs.
      </Text>

      {expanded ? (
        <View>
          <Text style={styles.resultHeading}>Do this now</Text>
          {assessment.firstAidSteps.map((step, index) => (
            <View key={step} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={18} color={COLORS.ERROR} />
            <View style={styles.warningCopy}>
              <Text style={styles.warningTitle}>Get urgent help if</Text>
              {assessment.warningSigns.map((sign) => (
                <Text key={sign} style={styles.warningText}>
                  • {sign}
                </Text>
              ))}
            </View>
          </View>
        </View>
      ) : null}

      {assessment.needsNearbyCare ? (
        <View style={styles.resultActions}>
          <Pressable onPress={onHospitals} style={styles.hospitalButton}>
            <Ionicons name="location" size={18} color="#FFFFFF" />
            <Text style={styles.resultButtonText}>Find hospital</Text>
          </Pressable>
          <Pressable onPress={onSOS} style={styles.emergencyButton}>
            <Ionicons name="alert-circle" size={18} color={COLORS.ERROR} />
            <Text style={styles.emergencyButtonText}>SOS</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function VoicePermissionSheet({
  canAskAgain,
  onClose,
  onEnable,
  visible,
}: {
  canAskAgain: boolean;
  onClose: () => void;
  onEnable: () => void;
  visible: boolean;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.modalBackdrop}>
        <View style={styles.permissionSheet}>
          <View style={styles.permissionMark}>
            <Ionicons name="mic" size={30} color="#FFFFFF" />
          </View>
          <Text style={styles.permissionTitle}>Use your voice</Text>
          <Text style={styles.permissionBody}>
            Smart Health needs microphone access only while you are speaking.
            Tap below, then choose Allow on the phone’s permission message.
          </Text>
          <View style={styles.permissionInfo}>
            <Ionicons name="lock-closed" size={16} color={COLORS.PRIMARY} />
            <Text style={styles.permissionInfoText}>
              Your microphone never runs in the background.
            </Text>
          </View>
          <Pressable onPress={onEnable} style={styles.enableButton}>
            <Ionicons
              name={canAskAgain ? "mic" : "settings"}
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.enableButtonText}>
              {canAskAgain ? "ENABLE MICROPHONE" : "OPEN PHONE SETTINGS"}
            </Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.typeInsteadButton}>
            <Text style={styles.typeInsteadText}>I’ll type instead</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: COLORS.BACKGROUND_LIGHT, flex: 1 },
  keyboardView: { flex: 1 },
  header: {
    alignItems: "center",
    borderBottomColor: COLORS.BORDER_LIGHT,
    borderBottomWidth: 1,
    flexDirection: "row",
    height: 66,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  aiIdentity: { alignItems: "center", flexDirection: "row" },
  aiMark: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 6,
    height: 42,
    justifyContent: "center",
    marginRight: 10,
    width: 42,
  },
  title: { color: COLORS.TEXT_PRIMARY, fontSize: 17, fontWeight: "900" },
  statusRow: { alignItems: "center", flexDirection: "row", marginTop: 2 },
  statusDot: {
    backgroundColor: COLORS.SUCCESS,
    borderRadius: 3,
    height: 6,
    marginRight: 5,
    width: 6,
  },
  statusText: { color: COLORS.TEXT_SECONDARY, fontSize: 10 },
  headerActions: { alignItems: "center", flexDirection: "row", gap: 8 },
  headerIconButton: {
    alignItems: "center",
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 6,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  sosButton: {
    alignItems: "center",
    backgroundColor: "#FDECEA",
    borderRadius: 6,
    height: 38,
    justifyContent: "center",
    paddingHorizontal: 13,
  },
  sosButtonText: { color: COLORS.ERROR, fontSize: 11, fontWeight: "900" },
  voiceBar: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderBottomColor: "#C9E1F3",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  voiceButton: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 6,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  voiceButtonActive: { backgroundColor: COLORS.ERROR },
  voiceText: { flex: 1, marginLeft: 12 },
  voiceTitle: { color: COLORS.TEXT_PRIMARY, fontSize: 14, fontWeight: "900" },
  voiceSubtitle: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  listeningBadge: {
    backgroundColor: COLORS.ERROR,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  listeningText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },
  messageScroller: { backgroundColor: COLORS.BACKGROUND, flex: 1 },
  messageList: { padding: 14, paddingBottom: 18 },
  safetyNote: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    marginBottom: 14,
  },
  safetyText: { color: COLORS.TEXT_LIGHT, fontSize: 10, marginLeft: 5 },
  conversationStarter: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 16,
    padding: 14,
  },
  starterEyebrow: {
    color: COLORS.PRIMARY,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  starterTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 23,
    marginTop: 6,
  },
  starterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  starterChip: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderColor: "#C9E1F3",
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  starterChipText: {
    color: COLORS.PRIMARY_DARK,
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 6,
  },
  message: { marginBottom: 11, padding: 12 },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 4,
    borderTopLeftRadius: 0,
    borderWidth: 1,
    maxWidth: "90%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.PRIMARY_DARK,
    borderRadius: 4,
    borderTopRightRadius: 0,
    maxWidth: "82%",
  },
  assessmentMessage: { maxWidth: "100%", width: "100%" },
  messageAuthor: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  authorLeft: { alignItems: "center", flexDirection: "row" },
  miniAiMark: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 6,
    height: 20,
    justifyContent: "center",
    marginRight: 6,
    width: 20,
  },
  messageAuthorText: {
    color: COLORS.PRIMARY,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  readButton: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderColor: "#C9E1F3",
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  readButtonText: {
    color: COLORS.PRIMARY_DARK,
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 4,
  },
  messageText: { color: COLORS.TEXT_PRIMARY, fontSize: 14, lineHeight: 20 },
  userMessageText: { color: "#FFFFFF" },
  image: { borderRadius: 3, height: 160, marginBottom: 9, width: 220 },
  assessment: {
    borderTopColor: COLORS.BORDER_LIGHT,
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  assessmentHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  assessmentRight: { alignItems: "center", flexDirection: "row", gap: 10 },
  assessmentLabel: {
    color: COLORS.TEXT_LIGHT,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  assessmentLevel: { fontSize: 18, fontWeight: "900", marginTop: 2 },
  scoreCircle: {
    alignItems: "baseline",
    borderRadius: 6,
    borderWidth: 2,
    flexDirection: "row",
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  scoreText: { fontSize: 19, fontWeight: "900" },
  scoreUnit: { fontSize: 8, fontWeight: "800" },
  assessmentHint: {
    color: COLORS.TEXT_LIGHT,
    fontSize: 10,
    marginTop: 8,
  },
  resultHeading: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 9,
    marginTop: 14,
  },
  step: { alignItems: "flex-start", flexDirection: "row", marginBottom: 8 },
  stepNumber: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: 6,
    height: 19,
    justifyContent: "center",
    marginRight: 8,
    width: 19,
  },
  stepNumberText: {
    color: COLORS.PRIMARY_DARK,
    fontSize: 9,
    fontWeight: "900",
  },
  stepText: {
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  warningBox: {
    alignItems: "flex-start",
    backgroundColor: "#FDECEA",
    borderLeftColor: COLORS.ERROR,
    borderLeftWidth: 3,
    flexDirection: "row",
    marginTop: 10,
    padding: 10,
  },
  warningCopy: { flex: 1, marginLeft: 8 },
  warningTitle: { color: COLORS.ERROR, fontSize: 11, fontWeight: "900" },
  warningText: { color: "#7D2A23", fontSize: 11, lineHeight: 16, marginTop: 2 },
  resultActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  hospitalButton: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 42,
  },
  resultButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 6,
  },
  emergencyButton: {
    alignItems: "center",
    borderColor: COLORS.ERROR,
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  emergencyButtonText: {
    color: COLORS.ERROR,
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 5,
  },
  imagePreview: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderTopColor: "#C9E1F3",
    borderTopWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorBanner: {
    alignItems: "center",
    backgroundColor: "#FDECEA",
    borderTopColor: "#F5C2BD",
    borderTopWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  errorBannerText: {
    color: "#7D2A23",
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    marginHorizontal: 8,
  },
  previewImage: { borderRadius: 3, height: 42, width: 42 },
  previewCopy: { flex: 1, marginLeft: 9 },
  previewTitle: { color: COLORS.TEXT_PRIMARY, fontSize: 12, fontWeight: "800" },
  previewSubtitle: { color: COLORS.TEXT_SECONDARY, fontSize: 10, marginTop: 2 },
  composer: {
    alignItems: "flex-end",
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderTopColor: COLORS.BORDER_LIGHT,
    borderTopWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  composerAction: {
    alignItems: "center",
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 4,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 42,
  },
  composerMicActive: {
    backgroundColor: COLORS.ERROR,
    borderColor: COLORS.ERROR,
  },
  input: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
    borderRadius: 4,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    fontSize: 13,
    marginHorizontal: 7,
    maxHeight: 92,
    minHeight: 44,
    paddingHorizontal: 11,
    paddingVertical: 11,
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_DARK,
    borderRadius: 4,
    height: 44,
    justifyContent: "center",
    marginLeft: 7,
    width: 44,
  },
  sendButtonDisabled: { opacity: 0.35 },
  modalBackdrop: {
    backgroundColor: "rgba(33,43,50,0.55)",
    flex: 1,
    justifyContent: "flex-end",
  },
  permissionSheet: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingBottom: 24,
    paddingHorizontal: 22,
    paddingTop: 25,
  },
  permissionMark: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 6,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  permissionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 15,
  },
  permissionBody: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center",
  },
  permissionInfo: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    flexDirection: "row",
    marginTop: 15,
    padding: 11,
    width: "100%",
  },
  permissionInfoText: {
    color: COLORS.PRIMARY_DARK,
    flex: 1,
    fontSize: 11,
    marginLeft: 8,
  },
  enableButton: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_DARK,
    borderRadius: 4,
    flexDirection: "row",
    height: 52,
    justifyContent: "center",
    marginTop: 16,
    width: "100%",
  },
  enableButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginLeft: 7,
  },
  typeInsteadButton: { padding: 12 },
  typeInsteadText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: "700",
  },
});
