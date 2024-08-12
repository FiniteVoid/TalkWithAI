import * as React from "react";
import { useLocalSearchParams } from "expo-router";
import { ChatInterface } from "~/components/ui/chat/interface";
import { View, Text } from "react-native";

export default function Screen() {
  const { sessionId, topic } = useLocalSearchParams<{
    sessionId?: string;
    topic?: string;
  }>();

  return <ChatInterface sessionId={sessionId} />;
}
