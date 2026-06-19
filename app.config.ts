import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const googleMapsApiKey = process.env.EXPO_GOOGLE_MAP_API_KEY;

  return {
    ...config,
    name: config.name ?? "Smart Health",
    slug: config.slug ?? "smart-healty",
    extra: {
      ...config.extra,
      apiBaseUrl: process.env.EXPO_BASE_URL,
      googleMapsApiKey,
    },
    ios: {
      ...config.ios,
      bundleIdentifier: "com.smarthealthy.smarthealty",
      config: {
        ...config.ios?.config,
        googleMapsApiKey,
      },
    },
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: googleMapsApiKey ?? "",
        },
      },
    },
  };
};
