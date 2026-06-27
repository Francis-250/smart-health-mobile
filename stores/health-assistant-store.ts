import * as FileSystem from "expo-file-system/legacy";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import { api, getApiError } from "@/lib/api";

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

type BackendRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";

type ChatResponse = {
  conversationId: string;
  message: {
    id: string;
    content: string;
    createdAt: string;
  };
  assessment: {
    createdAt: string;
    recommendation: string;
    warnings: string[];
    riskScore: number;
    riskLevel: BackendRiskLevel;
    emergencyReason?: string | null;
  };
};

const INITIAL_MESSAGE: AssistantMessage = {
  id: "welcome",
  role: "assistant",
  text: "Tell me what happened, describe your symptoms, or attach an injury photo. I’ll provide immediate first-aid guidance.",
};

const IMAGE_ANALYSIS_PROMPT =
  "Analyze the attached injury or symptom photo carefully. Describe what is visibly concerning, such as bleeding, swelling, bruising, redness, burns, wound depth, discharge, deformity, or contamination. Do not pretend to know details that are not visible. Give immediate first-aid steps, risk level, warning signs, and ask one or two follow-up questions if needed.";

function mapRiskLevel(level: BackendRiskLevel): RiskLevel {
  if (level === "EMERGENCY") return "critical";
  if (level === "HIGH") return "high";
  if (level === "MEDIUM") return "moderate";
  return "low";
}

function extractSteps(reply: string, recommendation: string) {
  const numberedSteps = reply
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+[.)]\s+/.test(line))
    .map((line) => line.replace(/^\d+[.)]\s+/, ""));

  return numberedSteps.length
    ? numberedSteps
    : recommendation
        .split(/\n|(?<=[.!?])\s+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 4);
}

async function imageToDataUrl(imageUri: string) {
  const extension = imageUri.split(".").pop()?.toLowerCase();
  const mime =
    extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg";
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return `data:${mime};base64,${base64}`;
}

type HealthAssistantState = {
  messages: AssistantMessage[];
  conversationId: string | null;
  loading: boolean;
  error: string | null;
  sendMessage: (
    text: string,
    imageUri?: string,
  ) => Promise<HealthAssessment | null>;
  clearConversation: () => void;
  clearError: () => void;
};

const secureStorage: StateStorage = {
  getItem: (name) => SecureStore.getItemAsync(name),
  setItem: (name, value) => SecureStore.setItemAsync(name, value),
  removeItem: (name) => SecureStore.deleteItemAsync(name),
};

export const useHealthAssistantStore = create<HealthAssistantState>()(
  persist(
    (set, get) => ({
      messages: [INITIAL_MESSAGE],
      conversationId: null,
      loading: false,
      error: null,
      sendMessage: async (text, imageUri) => {
        const userText = text.trim();
        const cleanText = imageUri
          ? userText
            ? `${userText}\n\n${IMAGE_ANALYSIS_PROMPT}`
            : IMAGE_ANALYSIS_PROMPT
          : userText;
        const userMessage: AssistantMessage = {
          id: `local-${Date.now()}`,
          role: "user",
          text: userText || "Please analyze this injury photo.",
          imageUri,
        };
        set((state) => ({
          error: null,
          loading: true,
          messages: [...state.messages, userMessage],
        }));

        try {
          const imageUrl = imageUri
            ? await imageToDataUrl(imageUri)
            : undefined;
          const { data } = await api.post<ChatResponse>("/ai/chat", {
            conversationId: get().conversationId ?? undefined,
            message: cleanText,
            imageUrl,
          });
          const riskLevel = mapRiskLevel(data.assessment.riskLevel);
          const assessment: HealthAssessment = {
            createdAt: data.assessment.createdAt,
            riskScore: data.assessment.riskScore,
            riskLevel,
            summary: data.message.content,
            firstAidSteps: extractSteps(
              data.message.content,
              data.assessment.recommendation,
            ),
            warningSigns: data.assessment.warnings,
            needsNearbyCare:
              riskLevel === "high" || riskLevel === "critical",
          };
          const assistantMessage: AssistantMessage = {
            id: data.message.id,
            role: "assistant",
            text: data.message.content,
            assessment,
          };

          set((state) => ({
            conversationId: data.conversationId,
            error: null,
            loading: false,
            messages: [...state.messages, assistantMessage].slice(-31),
          }));
          return assessment;
        } catch (requestError) {
          set({
            error: getApiError(requestError),
            loading: false,
          });
          return null;
        }
      },
      clearConversation: () =>
        set({
          messages: [INITIAL_MESSAGE],
          conversationId: null,
          error: null,
        }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "smart-health-assessments",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        messages: state.messages,
        conversationId: state.conversationId,
      }),
    },
  ),
);
