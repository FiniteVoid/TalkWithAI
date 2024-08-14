import React from "react";
import { ScrollView, View } from "react-native";
import { Message, MessageProps } from "./message";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: MessageProps[];
  currentAIResponse?: string | null;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentAIResponse,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom when messages change or when there's a current AI response
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, currentAIResponse]);

  return (
    <ScrollView ref={scrollViewRef} className="flex-1 p-3 w-full">
      {messages.map((message, index) => (
        <Animated.View key={index} entering={FadeIn} exiting={FadeOut}>
          <Message text={message.text} isUser={message.isUser} />
        </Animated.View>
      ))}
      {currentAIResponse && (
        <Animated.View entering={FadeIn} exiting={FadeOut}>
          <Message text={currentAIResponse} isUser={false} isStreaming={true} />
        </Animated.View>
      )}
      <View className="h-4" />
    </ScrollView>
  );
};
