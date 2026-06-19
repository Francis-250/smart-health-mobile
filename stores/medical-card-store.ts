import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

export type MedicalCard = {
  bloodGroup: string;
  allergies: string;
  conditions: string;
  medications: string;
};

type MedicalCardState = MedicalCard & {
  updateMedicalCard: (card: MedicalCard) => void;
};

const secureStorage: StateStorage = {
  getItem: (name) => SecureStore.getItemAsync(name),
  setItem: (name, value) => SecureStore.setItemAsync(name, value),
  removeItem: (name) => SecureStore.deleteItemAsync(name),
};

export const useMedicalCardStore = create<MedicalCardState>()(
  persist(
    (set) => ({
      bloodGroup: "",
      allergies: "",
      conditions: "",
      medications: "",
      updateMedicalCard: (card) => set(card),
    }),
    {
      name: "smart-health-medical-card",
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
