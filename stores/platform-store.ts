import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import { RiskLevel } from "@/stores/health-assistant-store";

export type ReviewStatus = "pending" | "reviewed" | "escalated";

export type ReviewCase = {
  id: string;
  patientId: string;
  patientName: string;
  symptoms: string;
  riskScore: number;
  riskLevel: RiskLevel;
  createdAt: string;
  status: ReviewStatus;
  reviewerNote: string;
};

export type Appointment = {
  id: string;
  patientName: string;
  time: string;
  reason: string;
  status: "scheduled" | "completed" | "cancelled";
};

export type ManagedContent = {
  id: string;
  title: string;
  type: "first-aid" | "hospital";
  status: "published" | "draft";
  updatedAt: string;
};

const initialCases: ReviewCase[] = [
  {
    id: "case-1001",
    patientId: "patient-1",
    patientName: "Alice Patient",
    symptoms: "Chest pain with shortness of breath",
    riskScore: 95,
    riskLevel: "critical",
    createdAt: "2026-06-19T07:30:00.000Z",
    status: "escalated",
    reviewerNote: "Immediate emergency referral recommended.",
  },
  {
    id: "case-1002",
    patientId: "patient-2",
    patientName: "Eric Mugisha",
    symptoms: "Deep cut on left hand with continued bleeding",
    riskScore: 74,
    riskLevel: "high",
    createdAt: "2026-06-19T08:20:00.000Z",
    status: "pending",
    reviewerNote: "",
  },
  {
    id: "case-1003",
    patientId: "patient-3",
    patientName: "Grace Uwera",
    symptoms: "Fever and headache for two days",
    riskScore: 38,
    riskLevel: "moderate",
    createdAt: "2026-06-18T15:10:00.000Z",
    status: "reviewed",
    reviewerNote: "Hydration and same-day clinic review if fever persists.",
  },
  {
    id: "case-1004",
    patientId: "patient-4",
    patientName: "Patrick N.",
    symptoms: "Minor ankle swelling after sports",
    riskScore: 20,
    riskLevel: "low",
    createdAt: "2026-06-18T11:45:00.000Z",
    status: "pending",
    reviewerNote: "",
  },
];

const initialAppointments: Appointment[] = [
  {
    id: "apt-1",
    patientName: "Alice Patient",
    time: "09:00",
    reason: "Emergency follow-up",
    status: "scheduled",
  },
  {
    id: "apt-2",
    patientName: "Grace Uwera",
    time: "11:30",
    reason: "Fever assessment",
    status: "scheduled",
  },
  {
    id: "apt-3",
    patientName: "Eric Mugisha",
    time: "14:00",
    reason: "Wound review",
    status: "scheduled",
  },
];

const initialContent: ManagedContent[] = [
  {
    id: "content-1",
    title: "Severe Bleeding",
    type: "first-aid",
    status: "published",
    updatedAt: "2026-06-18",
  },
  {
    id: "content-2",
    title: "Child CPR",
    type: "first-aid",
    status: "draft",
    updatedAt: "2026-06-19",
  },
  {
    id: "content-3",
    title: "Kigali University Teaching Hospital",
    type: "hospital",
    status: "published",
    updatedAt: "2026-06-17",
  },
  {
    id: "content-4",
    title: "Nyamata District Hospital",
    type: "hospital",
    status: "draft",
    updatedAt: "2026-06-19",
  },
];

type PlatformState = {
  cases: ReviewCase[];
  appointments: Appointment[];
  content: ManagedContent[];
  reviewCase: (id: string, note: string, status: ReviewStatus) => void;
  updateAppointment: (id: string, status: Appointment["status"]) => void;
  toggleContentStatus: (id: string) => void;
  addContent: (title: string, type: ManagedContent["type"]) => void;
};

const storage: StateStorage = {
  getItem: (name) => SecureStore.getItemAsync(name),
  setItem: (name, value) => SecureStore.setItemAsync(name, value),
  removeItem: (name) => SecureStore.deleteItemAsync(name),
};

export const usePlatformStore = create<PlatformState>()(
  persist(
    (set) => ({
      cases: initialCases,
      appointments: initialAppointments,
      content: initialContent,
      reviewCase: (id, reviewerNote, status) =>
        set((state) => ({
          cases: state.cases.map((item) =>
            item.id === id ? { ...item, reviewerNote, status } : item,
          ),
        })),
      updateAppointment: (id, status) =>
        set((state) => ({
          appointments: state.appointments.map((item) =>
            item.id === id ? { ...item, status } : item,
          ),
        })),
      toggleContentStatus: (id) =>
        set((state) => ({
          content: state.content.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: item.status === "published" ? "draft" : "published",
                  updatedAt: new Date().toISOString().slice(0, 10),
                }
              : item,
          ),
        })),
      addContent: (title, type) =>
        set((state) => ({
          content: [
            {
              id: `content-${Date.now()}`,
              title,
              type,
              status: "draft",
              updatedAt: new Date().toISOString().slice(0, 10),
            },
            ...state.content,
          ],
        })),
    }),
    {
      name: "smart-health-platform-demo",
      storage: createJSONStorage(() => storage),
    },
  ),
);
