import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SID_STORAGE_KEY = "tappedin.sid";

export async function getSessionSid() {
  if (Platform.OS === "web") {
    return globalThis.localStorage?.getItem(SID_STORAGE_KEY) ?? null;
  }

  return SecureStore.getItemAsync(SID_STORAGE_KEY);
}

export async function setSessionSid(sid: string) {
  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(SID_STORAGE_KEY, sid);
    return;
  }

  await SecureStore.setItemAsync(SID_STORAGE_KEY, sid);
}

export async function clearSessionSid() {
  if (Platform.OS === "web") {
    globalThis.localStorage?.removeItem(SID_STORAGE_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(SID_STORAGE_KEY);
}
