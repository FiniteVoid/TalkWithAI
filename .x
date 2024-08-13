import { withPlugins } from "@expo/config-plugins";
import { ConfigContext, ExpoConfig } from "expo/config";

import { withAndroidExpoSSEPatch } from "./plugins";

const baseConfig: ExpoConfig = {
  name: "Talk To AI",
  slug: "Talk To AI",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#000000",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#000000",
    },
    package: "com.finitevoid.talktoai",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    [
      "expo-build-properties",
      {
        android: {
          // allow connecting to local http server while in release mode.
          usesCleartextTraffic: true,
        },
      },
    ],
  ],
};

export default function setupConfig({ config }: ConfigContext) {
  const expoConfig = {
    ...config,
    ...baseConfig,
  };

  if (process.env.SSE_NO_FIX === "true") {
    return expoConfig;
  }

  withPlugins(expoConfig, [withAndroidExpoSSEPatch]);

  return expoConfig;
}
