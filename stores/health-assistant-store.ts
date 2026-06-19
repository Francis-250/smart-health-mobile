import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type HealthAssessment = {
  createdAt: string;
  riskScore: number;
  riskLevel: RiskLevel;
  summary: string;
  firstAidSteps: string[];
  warningSigns: string[];
  needsNearbyCare: boolean;
};

export type AssistantMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  imageUri?: string;
  assessment?: HealthAssessment;
};

const INITIAL_MESSAGE: AssistantMessage = {
  id: "welcome",
  role: "assistant",
  text: "Describe your symptoms by text or voice, or upload an injury photo. I’ll provide a preliminary risk check and safe next steps.",
};

function createAssessment(
  message: string,
  hasImage: boolean,
): HealthAssessment {
  const text = message.toLowerCase();
  const createdAt = new Date().toISOString();
  const isCritical = [
    "chest pain",
    "can't breathe",
    "cannot breathe",
    "unconscious",
    "not breathing",
    "heavy bleeding",
    "seizure",
    "stroke",
  ].some((term) => text.includes(term));

  if (isCritical) {
    return {
      createdAt,
      riskScore: 95,
      riskLevel: "critical",
      summary:
        "Your description contains emergency warning signs. Get emergency help now.",
      firstAidSteps: [
        "Call your local emergency service immediately.",
        "Stay with the person and keep them as still and comfortable as possible.",
        "Do not give food, drink, or medication unless a professional instructs you.",
      ],
      warningSigns: [
        "Breathing difficulty",
        "Loss of consciousness",
        "Severe or uncontrolled bleeding",
      ],
      needsNearbyCare: true,
    };
  }

  if (
    hasImage ||
    ["wound", "cut", "burn", "injury", "rash", "swelling"].some((term) =>
      text.includes(term),
    )
  ) {
    return {
      createdAt,
      riskScore: hasImage ? 58 : 48,
      riskLevel: "moderate",
      summary:
        "This injury needs monitoring. A photo alone cannot confirm its severity or cause.",
      firstAidSteps: [
        "Move away from danger and wash your hands before touching the area.",
        "For bleeding, apply steady pressure with a clean cloth.",
        "Keep the area clean and loosely covered; do not apply unknown remedies.",
      ],
      warningSigns: [
        "Bleeding that does not stop",
        "Increasing pain, redness, heat, pus, or fever",
        "Deep wound, loss of feeling, or reduced movement",
      ],
      needsNearbyCare: true,
    };
  }

  if (
    ["high fever", "vomiting", "severe pain", "dizzy", "faint"].some((term) =>
      text.includes(term),
    )
  ) {
    return {
      createdAt,
      riskScore: 72,
      riskLevel: "high",
      summary:
        "Your symptoms may need prompt in-person medical assessment today.",
      firstAidSteps: [
        "Rest in a safe place and ask someone to stay nearby.",
        "Take small sips of water if you are awake and able to swallow.",
        "Avoid driving yourself if you feel faint, confused, or very weak.",
      ],
      warningSigns: [
        "Symptoms becoming rapidly worse",
        "Confusion, fainting, or difficulty staying awake",
        "Unable to keep fluids down",
      ],
      needsNearbyCare: true,
    };
  }

  if (
    ["fever", "headache", "stomach", "cough", "pain"].some((term) =>
      text.includes(term),
    )
  ) {
    return {
      createdAt,
      riskScore: 35,
      riskLevel: "moderate",
      summary:
        "No immediate emergency sign was detected, but monitor your symptoms closely.",
      firstAidSteps: [
        "Rest and drink fluids if you can safely do so.",
        "Track when symptoms started and whether they are getting worse.",
        "Contact a clinician if symptoms persist or concern you.",
      ],
      warningSigns: [
        "New breathing difficulty",
        "Severe or rapidly worsening pain",
        "Confusion, fainting, or dehydration",
      ],
      needsNearbyCare: false,
    };
  }

  return {
    createdAt,
    riskScore: 18,
    riskLevel: "low",
    summary:
      "I need more detail to estimate risk. This preliminary score is not a diagnosis.",
    firstAidSteps: [
      "Rest and avoid activities that make symptoms worse.",
      "Describe when this started, severity from 1–10, and other symptoms.",
      "Contact a clinician if symptoms continue or worsen.",
    ],
    warningSigns: [
      "Breathing difficulty",
      "Loss of consciousness",
      "Severe pain or bleeding",
    ],
    needsNearbyCare: false,
  };
}

type HealthAssistantState = {
  messages: AssistantMessage[];
  sendMessage: (text: string, imageUri?: string) => HealthAssessment;
  clearConversation: () => void;
};

const secureStorage: StateStorage = {
  getItem: (name) => SecureStore.getItemAsync(name),
  setItem: (name, value) => SecureStore.setItemAsync(name, value),
  removeItem: (name) => SecureStore.deleteItemAsync(name),
};

export const useHealthAssistantStore = create<HealthAssistantState>()(
  persist(
    (set) => ({
      messages: [INITIAL_MESSAGE],
      sendMessage: (text, imageUri) => {
        const cleanText = text.trim();
        const timestamp = Date.now();
        const assessment = createAssessment(cleanText, Boolean(imageUri));
        const userMessage: AssistantMessage = {
          id: `user-${timestamp}`,
          role: "user",
          text:
            cleanText || "I uploaded an injury photo for a preliminary review.",
          imageUri,
        };
        const assistantMessage: AssistantMessage = {
          id: `assistant-${timestamp}`,
          role: "assistant",
          text: assessment.summary,
          assessment,
        };

        set((state) => ({
          messages: [...state.messages, userMessage, assistantMessage].slice(
            -21,
          ),
        }));
        return assessment;
      },
      clearConversation: () => set({ messages: [INITIAL_MESSAGE] }),
    }),
    {
      name: "smart-health-assessments",
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
