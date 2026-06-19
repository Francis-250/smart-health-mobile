import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Speech from "expo-speech";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
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
import { useHealthAssistantStore } from "@/stores/health-assistant-store";

export default function PatientAssistant() {
  const [message, setMessage] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [isListening, setIsListening] = useState(false);
  const { messages, sendMessage } = useHealthAssistantStore();

  const pickImage = async () => {
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

  const submit = () => {
    if (!message.trim() && !imageUri) return;
    const response = sendMessage(message, imageUri);
    Speech.speak(response, { language: "en-US", rate: 0.92 });
    setMessage("");
    setImageUri(undefined);
  };

  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    Alert.alert(
      "Voice chat preview",
      "The microphone design works in Expo Go. Live speech recognition requires a development build.",
      [{ text: "OK", onPress: () => setIsListening(false) }],
    );
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
            onPress={pickImage}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
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
});
