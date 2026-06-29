import * as SecureStore from "expo-secure-store";
import { useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useNotifications } from "@/hooks/useNotifications";

const HOSPITAL_IDS_KEY = "smart-health-known-hospital-ids";
const POLL_INTERVAL_MS = 30000;

type BackendHospital = {
  id: string;
  name: string;
  address: string;
};

export function useHospitalNotifications(enabled: boolean) {
  const { sendLocalNotification } = useNotifications();
  const sendingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    let interval: ReturnType<typeof setInterval> | undefined;

    const checkHospitals = async () => {
      if (sendingRef.current) return;
      sendingRef.current = true;

      try {
        const { data } = await api.get<BackendHospital[]>("/hospitals");
        if (!active) return;

        const currentIds = data.map((hospital) => hospital.id);
        const previousRaw = await SecureStore.getItemAsync(HOSPITAL_IDS_KEY);

        if (!previousRaw) {
          await SecureStore.setItemAsync(
            HOSPITAL_IDS_KEY,
            JSON.stringify(currentIds),
          );
          return;
        }

        const previousIds = new Set(JSON.parse(previousRaw) as string[]);
        const newHospitals = data.filter(
          (hospital) => !previousIds.has(hospital.id),
        );

        if (newHospitals.length) {
          await SecureStore.setItemAsync(
            HOSPITAL_IDS_KEY,
            JSON.stringify(currentIds),
          );

          const first = newHospitals[0];
          await sendLocalNotification(
            newHospitals.length === 1
              ? "New hospital added"
              : `${newHospitals.length} new hospitals added`,
            newHospitals.length === 1
              ? `${first.name} is now available in Smart Health.`
              : "Open Hospitals to view the latest care locations.",
            {
              hospitalId: first.id,
              screen: "hospitals",
            },
          );
        }
      } catch {
        // Keep this quiet; patients should not see background polling failures.
      } finally {
        sendingRef.current = false;
      }
    };

    checkHospitals();
    interval = setInterval(checkHospitals, POLL_INTERVAL_MS);

    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [enabled, sendLocalNotification]);
}
