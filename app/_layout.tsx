import "~/global.css";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Theme, ThemeProvider } from "@react-navigation/native";
import { SplashScreen, Stack, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { PortalHost } from "@rn-primitives/portal";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Text } from "~/components/ui/text";

import { Drawer } from "expo-router/drawer";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { deleteDatabaseSync, openDatabaseSync } from "expo-sqlite/next";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "~/drizzle/migrations";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getChatSessions } from "~/db/services";
import { Menu } from "~/lib/icons/Menu";
import { Search } from "~/lib/icons/Search";
import { Plus } from "~/lib/icons/Plus";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { CustomDrawerContent } from "~/components/customDrawer";
import { OptionsPopover } from "~/components/ui/settingsPopOver";
// deleteDatabaseSync("db.db");
const expoDb = openDatabaseSync("db.db");
const db = drizzle(expoDb);

const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export interface ChatSession {
  id: string;
  topic: string;
  timestamp: string | null;
}

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = React.useState<
    string | undefined
  >(undefined);

  React.useEffect(() => {
    loadSessions();
  }, [selectedSessionId]);

  const loadSessions = async () => {
    try {
      const chatSessions = await getChatSessions();
      setSessions(chatSessions);
    } catch (error) {
      console.error("Error loading chat sessions:", error);
    }
  };

  const { success, error } = useMigrations(db, migrations);

  React.useEffect(() => {
    (async () => {
      const theme = await AsyncStorage.getItem("theme");
      if (Platform.OS === "web") {
        // Adds the background color to the html element to prevent white background on overscroll.
        document.documentElement.classList.add("bg-background");
      }
      if (!theme) {
        AsyncStorage.setItem("theme", colorScheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === "dark" ? "dark" : "light";
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);

        setIsColorSchemeLoaded(true);
        return;
      }
      setIsColorSchemeLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  } else if (!success) {
    return (
      <View>
        <Text>Migration is in progress...</Text>
      </View>
    );
  } else {
    if (!isColorSchemeLoaded) {
      return null;
    }

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
          <Drawer
            drawerContent={(props) => (
              <CustomDrawerContent
                {...props}
                sessions={sessions}
                loadSessions={loadSessions}
              />
            )}
            screenOptions={({ navigation }) => ({
              headerRight: () => <OptionsPopover />,
              headerLeft: () => (
                <Button
                  onPress={() => navigation.toggleDrawer()}
                  variant={"ghost"}
                  className="p-0 mx-0 !w-14"
                >
                  <Menu size={24} className="text-foreground" />
                </Button>
              ),
            })}
          >
            <Drawer.Screen
              name="index"
              options={{
                title: "Talk To AI",
              }}
            />
          </Drawer>
        </ThemeProvider>
        <PortalHost />
      </GestureHandlerRootView>
    );
  }
}
