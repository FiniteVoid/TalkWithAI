// components/ui/settingsPopOver.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EllipsisVertical } from "~/lib/icons/EllipsisVertical";
import { Settings2 } from "~/lib/icons/Settings2";
import * as React from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Text } from "~/components/ui/text";
import { ThemeToggle } from "../ThemeToggle";
import { useColorScheme } from "~/lib/useColorScheme";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
import { Input } from "./input";

export function OptionsPopover() {
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const { isDarkColorScheme, setColorScheme } = useColorScheme();

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
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex justify-start items-center flex-row gap-2 p-0 !h-16"
              >
                <Settings2 size={24} className="text-foreground" />
                <Text className="text-sm text-left">API Keys</Text>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit API Keys</DialogTitle>
                <DialogContent>
                  <Input className="flex-1 border rounded-full p-2 pl-5 !h-14 bg-accent" />
                </DialogContent>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're
                  done.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button>
                    <Text>OK</Text>
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PopoverContent>
      </Popover>
    </View>
  );
}
