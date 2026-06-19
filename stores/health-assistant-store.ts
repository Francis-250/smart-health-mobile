import { create } from "zustand";

export type AssistantMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  imageUri?: string;
};

const INITIAL_MESSAGE: AssistantMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hi! I’m your Smart Health assistant. Tell me how you feel or upload a photo. I can offer general guidance, but I can’t diagnose a condition.",
};

function recommendationFor(message: string, hasImage: boolean) {
  const text = message.toLowerCase();

  if (
    text.includes("chest pain") ||
    text.includes("can't breathe") ||
    text.includes("cannot breathe") ||
    text.includes("unconscious") ||
    text.includes("heavy bleeding")
  ) {
    return "This may be an emergency. Contact your local emergency service or go to the nearest emergency department now. Do not wait for an online response.";
  }

  if (text.includes("fever")) {
    return "Rest, drink fluids, and monitor your temperature. Seek medical care if the fever is very high, lasts more than a few days, or comes with breathing trouble, confusion, severe pain, or dehydration.";
  }

  if (text.includes("headache")) {
    return "Try resting, drinking water, and reducing bright light. Get urgent help for a sudden severe headache, weakness, confusion, fainting, fever with a stiff neck, or a headache after an injury.";
  }

  if (
    text.includes("rash") ||
    text.includes("skin") ||
    text.includes("wound") ||
    hasImage
  ) {
    return "I can’t confirm a skin or wound condition from a photo alone. Keep the area clean and avoid new products. Arrange a clinician review if it spreads, becomes painful or hot, drains pus, or comes with fever or facial swelling.";
  }

  if (text.includes("stomach") || text.includes("vomit")) {
    return "Take small sips of fluid and choose light foods when you can tolerate them. Seek care for severe or worsening pain, blood, persistent vomiting, fainting, or signs of dehydration.";
  }

  return "Thanks for sharing. Please tell me when this started, how severe it is, and whether you have other symptoms or medical conditions. A clinician should assess anything severe, persistent, or worsening.";
}

type HealthAssistantState = {
  messages: AssistantMessage[];
  sendMessage: (text: string, imageUri?: string) => string;
  clearConversation: () => void;
};

export const useHealthAssistantStore = create<HealthAssistantState>((set) => ({
  messages: [INITIAL_MESSAGE],
  sendMessage: (text, imageUri) => {
    const cleanText = text.trim();
    const timestamp = Date.now();
    const response = recommendationFor(cleanText, Boolean(imageUri));
    const userMessage: AssistantMessage = {
      id: `user-${timestamp}`,
      role: "user",
      text: cleanText || "I uploaded an image for guidance.",
      imageUri,
    };
    const assistantMessage: AssistantMessage = {
      id: `assistant-${timestamp}`,
      role: "assistant",
      text: response,
    };

    set((state) => ({
      messages: [...state.messages, userMessage, assistantMessage],
    }));
    return response;
  },
  clearConversation: () => set({ messages: [INITIAL_MESSAGE] }),
}));
