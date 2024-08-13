import AsyncStorage from "@react-native-async-storage/async-storage";
import { EllipsisVertical } from "~/lib/icons/EllipsisVertical";
import { Settings2 } from "~/lib/icons/Settings2";
import * as React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Text } from "~/components/ui/text";
import { ThemeToggle } from "../ThemeToggle";
import { useColorScheme } from "~/lib/useColorScheme";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
import { APIKeyDialog } from "~/components/APIKeyDialog";

export function OptionsPopover() {
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const { isDarkColorScheme, setColorScheme } = useColorScheme();
  const [isAPIKeyDialogOpen, setIsAPIKeyDialogOpen] = React.useState(false);

  const handleThemeToggle = () => {
    const newTheme = isDarkColorScheme ? "light" : "dark";
    setColorScheme(newTheme);
    setAndroidNavigationBar(newTheme);
    AsyncStorage.setItem("theme", newTheme);
  };

  return (
    <View className="flex-1 justify-center items-center p-0 mx-0">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="!w-14 p-6 ">
            <EllipsisVertical size={24} className="text-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          sideOffset={10}
          insets={contentInsets}
          className="w-40 flex-col gap-1 p-0"
        >
          <Button
            variant="ghost"
            className="w-full flex justify-start items-center flex-row gap-2 p-0 !h-16"
            onPress={handleThemeToggle}
          >
            <ThemeToggle />
            <Text className="text-sm text-left">Theme</Text>
          </Button>
          <Button
            variant="ghost"
            className="w-full flex justify-start items-center flex-row gap-2 p-0 !h-16"
            onPress={() => setIsAPIKeyDialogOpen(true)}
          >
            <Settings2 size={24} className="text-foreground" />
            <Text className="text-sm text-left">API Keys</Text>
          </Button>
        </PopoverContent>
      </Popover>
      <APIKeyDialog
        isOpen={isAPIKeyDialogOpen}
        onClose={() => setIsAPIKeyDialogOpen(false)}
      />
    </View>
  );
}
