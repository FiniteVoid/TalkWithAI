import React, { useEffect } from "react";
import { View, Button, ScrollView } from "react-native";
import useAnthropicStream from "~/src/adapters/anthropic";
import { Text } from "~/components/ui/text";
import * as Speech from "expo-speech";
import useSpeech from "~/src/services/speech";

const AnthropicStreamComponent = ({
  apiKey = "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",
}: {
  apiKey: string;
}) => {
  const { streamingContent, isLoading, error, streamResponse, stopStream } =
    useAnthropicStream({ apiKey, chunkSize: -1 });

  const { isSpeaking, pauseSpeech, resumeSpeech, stopSpeech, startSpeech } =
    useSpeech(streamingContent, {
      onSpeechStart: () => console.log("Speech started"),
      onSpeechDone: () => console.log("Speech finished"),
      onSpeechError: (error) => console.error("Speech error:", error),
    });

  const handleStartStream = () => {
    streamResponse({
      messages: [
        {
          role: "user",
          content: "Hi, tell me a veryyyy short story. Like 100 words or less.",
        },
      ],
      model: "claude-3-5-sonnet-20240620",
      maxTokens: 1024,
    });
  };

  return (
    <View>
      <Button
        title="Start Stream"
        onPress={() => {
          handleStartStream();
          stopSpeech();
          startSpeech();
        }}
        disabled={isLoading}
      />
      {isLoading && <Text>Loading...</Text>}
      {error && <Text>Error: {error}</Text>}
      <ScrollView>
        <Text>{streamingContent.join("")}</Text>
      </ScrollView>
    </View>
  );
};

export default AnthropicStreamComponent;
