import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

export type UserRole = "patient" | "expert";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type DummyUser = AuthUser & {
  password: string;
};

export const DUMMY_USERS: DummyUser[] = [
  {
    id: "patient-1",
    name: "Alice Patient",
    email: "patient@smarthealth.com",
    password: "patient123",
    role: "patient",
  },
  {
    id: "doctor-1",
    name: "Dr. Kevin Smith",
    email: "doctor@smarthealth.com",
    password: "doctor123",
    role: "expert",
  },
];

type AuthState = {
  user: AuthUser | null;
  error: string | null;
  hydrated: boolean;
  login: (email: string, password: string) => AuthUser | null;
  logout: () => void;
  clearError: () => void;
  setHydrated: (hydrated: boolean) => void;
};

const storage: StateStorage = {
  getItem: (name) => SecureStore.getItemAsync(name),
  setItem: (name, value) => SecureStore.setItemAsync(name, value),
  removeItem: (name) => SecureStore.deleteItemAsync(name),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      error: null,
      hydrated: false,
      login: (email, password) => {
        const matchedUser = DUMMY_USERS.find(
          (user) =>
            user.email.toLowerCase() === email.trim().toLowerCase() &&
            user.password === password,
        );

        if (!matchedUser) {
          set({ error: "Email or password is incorrect.", user: null });
          return null;
        }

        const { password: _password, ...user } = matchedUser;
        set({ error: null, user });
        return user;
      },
      logout: () => set({ error: null, user: null }),
      clearError: () => set({ error: null }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "smart-health-session",
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        const persistedRole = state?.user?.role as string | undefined;
        if (
          persistedRole &&
          persistedRole !== "patient" &&
          persistedRole !== "expert"
        ) {
          state?.logout();
        }
        state?.setHydrated(true);
      },
    },
  ),
);
