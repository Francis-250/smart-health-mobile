import axios, { AxiosError } from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "smart-health-api-token";
const configuredUrl = String(
  Constants.expoConfig?.extra?.apiBaseUrl ?? "",
).replace(/\/$/, "");

export const API_BASE_URL = configuredUrl.endsWith("/api")
  ? configuredUrl
  : `${configuredUrl}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  // Render free services may need extra time for the first request after sleeping.
  timeout: 60000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const saveApiToken = (token: string) =>
  SecureStore.setItemAsync(TOKEN_KEY, token);

export const clearApiToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

export const hasApiToken = async () =>
  Boolean(await SecureStore.getItemAsync(TOKEN_KEY));

export function getApiError(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { error?: string; message?: string }
      | undefined;
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        return "Smart Health is taking longer than expected to start. Please wait a moment and try again.";
      }
      return "Cannot connect to Smart Health. Check the API address and make sure the backend is running.";
    }
    return data?.error ?? data?.message ?? "Request failed. Please try again.";
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}
