import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@onboarding_done";

export async function setOnboardingDone() {
  await AsyncStorage.setItem(KEY, "true");
}

export async function getOnboardingDone() {
  const value = await AsyncStorage.getItem(KEY);
  return value === "true";
}
