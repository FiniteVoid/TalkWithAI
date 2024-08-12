// components/ThemeToggle.tsx
import { View } from "react-native";
import { MoonStar } from "~/lib/icons/MoonStar";
import { Sun } from "~/lib/icons/Sun";
import { useColorScheme } from "~/lib/useColorScheme";

export function ThemeToggle({ onPress }: { onPress?: () => void }) {
  const { isDarkColorScheme } = useColorScheme();
  return (
    <View className=" aspect-square pt-0.5 justify-center items-start">
      {isDarkColorScheme ? (
        <MoonStar className="text-foreground" size={23} strokeWidth={1.25} />
      ) : (
        <Sun className="text-foreground" size={24} strokeWidth={1.25} />
      )}
    </View>
  );
}
