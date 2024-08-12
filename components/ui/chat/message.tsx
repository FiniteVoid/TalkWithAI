import { ScrollView, View, Text } from "react-native";
import { Button } from "../button";
import { Input } from "../input";
import { useState } from "react";

export interface MessageProps {
  text: string;
  isUser: boolean;
}

// Message.tsx

export const Message: React.FC<MessageProps> = ({ text, isUser }) => {
  return (
    <View
      className={`p-3 rounded-lg  mb-3 ${
        isUser ? "bg-blue-500 self-end" : "bg-gray-300 self-start"
      }`}
    >
      <Text className={isUser ? "text-white" : "text-black"}>{text}</Text>
    </View>
  );
};
