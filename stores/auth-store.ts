import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import {
  api,
  clearApiToken,
  getApiError,
  hasApiToken,
  saveApiToken,
} from "@/lib/api";

export type UserRole = "patient" | "expert";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  profileImage?: string | null;
};

type BackendRole = "PATIENT" | "REVIEWER" | "ADMIN";

type BackendUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  profileImage?: string | null;
  role: BackendRole;
  isActive?: boolean;
};

type AuthResponse = {
  user: BackendUser;
  token: string | null;
  requiresApproval?: boolean;
};

type LoginResponse = {
  user: BackendUser;
  token: string;
};

type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: "PATIENT" | "REVIEWER";
};

type RegisterResult = {
  user: AuthUser | null;
  requiresApproval: boolean;
};

type AuthState = {
  user: AuthUser | null;
  error: string | null;
  hydrated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  register: (input: RegisterInput) => Promise<RegisterResult | null>;
  restoreSession: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setHydrated: (hydrated: boolean) => void;
};

function mapUser(user: BackendUser): AuthUser {
  if (user.role === "ADMIN") {
    throw new Error(
      "Administrator accounts are available on the web app only.",
    );
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    name: `${user.firstName} ${user.lastName}`.trim(),
    phoneNumber: user.phoneNumber,
    profileImage: user.profileImage,
    role: user.role === "REVIEWER" ? "expert" : "patient",
  };
}

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
      loading: false,
      login: async (email, password) => {
        set({ error: null, loading: true });
        try {
          const { data } = await api.post<LoginResponse>("/auth/login", {
            email: email.trim().toLowerCase(),
            password,
          });
          const user = mapUser(data.user);
          await saveApiToken(data.token);
          set({ error: null, loading: false, user });
          return user;
        } catch (error) {
          const message = getApiError(error);
          set({ error: message, loading: false, user: null });
          return null;
        }
      },
      register: async (input) => {
        set({ error: null, loading: true });
        try {
          const { data } = await api.post<AuthResponse>(
            "/auth/register",
            input,
          );
          if (data.requiresApproval || !data.token) {
            set({ error: null, loading: false, user: null });
            return { user: null, requiresApproval: true };
          }
          const user = mapUser(data.user);
          await saveApiToken(data.token);
          set({ error: null, loading: false, user });
          return { user, requiresApproval: false };
        } catch (error) {
          set({ error: getApiError(error), loading: false });
          return null;
        }
      },
      restoreSession: async () => {
        if (!(await hasApiToken())) return;
        try {
          const { data } = await api.get<BackendUser>("/auth/me");
          set({ user: mapUser(data) });
        } catch {
          await clearApiToken();
          set({ user: null });
        }
      },
      logout: async () => {
        await clearApiToken();
        set({ error: null, user: null });
      },
      clearError: () => set({ error: null }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "smart-health-session",
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        state?.restoreSession();
      },
    },
  ),
);
