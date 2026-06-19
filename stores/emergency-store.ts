import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

type EmergencyContact = {
  name: string;
  phone: string;
};

type EmergencyState = {
  contact: EmergencyContact;
  setContact: (contact: EmergencyContact) => void;
};

const secureStorage: StateStorage = {
  getItem: (name) => SecureStore.getItemAsync(name),
  setItem: (name, value) => SecureStore.setItemAsync(name, value),
  removeItem: (name) => SecureStore.deleteItemAsync(name),
};

export const useEmergencyStore = create<EmergencyState>()(
  persist(
    (set) => ({
      contact: {
        name: "",
        phone: "",
      },
      setContact: (contact) => set({ contact }),
    }),
    {
      name: "smart-health-emergency-contact",
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
