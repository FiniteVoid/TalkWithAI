import * as SecureStore from "expo-secure-store";

export const getManagedAPIKey = async () => {
  return await SecureStore.getItemAsync("anthropicAPI");
};

export const setManagedAPIKey = async (key: string) => {
  return await SecureStore.setItemAsync("anthropicAPI", key);
};
