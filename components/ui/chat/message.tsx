import { ScrollView, View, Text, Touchable } from "react-native";
import { Button } from "../button";
import { Input } from "../input";
import { useState } from "react";
import { LoaderPinwheel } from "~/lib/icons/LoaderPinwheel";
import { TouchableOpacity } from "react-native-gesture-handler";

export interface MessageProps {
  text: string;
  isUser: boolean;
}

// Message.tsx

export const Message: React.FC<MessageProps> = ({ text, isUser }) => {
  return (
    <TouchableOpacity activeOpacity={0.8} className="w-full p-0 m-0">
      <View
        className={`rounded-lg  mb-5 flex flex-row gap-3 ${
          isUser ? "p-3 bg-blue-500 self-end" : "bg-transparent self-start"
        }`}
      >
        {!isUser && (
          <Button className="rounded-full px-0 !p-0 !h-12 !w-12">
            <LoaderPinwheel className="text-background" size={24} />
          </Button>
        )}
        <Text className={`${isUser ? `text-white` : `text-foreground mt-3`}`}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
