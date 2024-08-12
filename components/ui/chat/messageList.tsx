import { ScrollView } from "react-native";
import { Message, MessageProps } from "./message";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useEffect, useRef } from "react";
import { View } from "lucide-react-native";

interface MessageListProps {
  messages: MessageProps[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);
  return (
    <ScrollView ref={scrollViewRef} className="flex-1 p-3 w-full">
      {messages.map((message, index) => (
        <Animated.View key={index} entering={FadeIn} exiting={FadeOut}>
          <Message text={message.text} isUser={message.isUser} />
        </Animated.View>
      ))}
      <View className="h-4" />
    </ScrollView>
  );
};
