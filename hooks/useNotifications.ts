import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null,
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) setExpoPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const sendLocalNotification = useCallback(async (
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data },
      trigger: null,
    });
  }, []);

  return {
    expoPushToken,
    notification,
    sendLocalNotification,
  };
}

async function registerForPushNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      importance: Notifications.AndroidImportance.MAX,
      lightColor: "#126E82",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      name: "Smart Health alerts",
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const finalPermission =
    current.status === "granted"
      ? current
      : await Notifications.requestPermissionsAsync();

  if (finalPermission.status !== "granted") {
    console.warn("Notification permission denied");
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: "69ea2e72-12c7-4c50-b60e-01d7cdafb328",
    });

    console.log("Expo Push Token:", token.data);
    return token.data;
  } catch (error) {
    console.warn("Expo push token unavailable:", error);
    return null;
  }
}
