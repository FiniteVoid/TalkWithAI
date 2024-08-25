import React, { useEffect } from "react";
import { View, Button, ScrollView } from "react-native";
import useAnthropicStream from "~/src/adapters/anthropic";
import { Text } from "~/components/ui/text";
import * as Speech from "expo-speech";
import useSpeech from "~/src/services/speech";
import { startActivityAsync, ActivityAction } from "expo-intent-launcher";
import { getManagedAPIKey } from "~/src/services/keyManagement";
const AnthropicStreamComponent = ({
  apiKey = "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",
}: {
  apiKey: string;
}) => {
  const { streamingContent, isLoading, error, streamResponse, stopStream } =
    useAnthropicStream({ apiKey, chunkSize: -1 });

  const {
    isSpeaking,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
    startSpeech,
    updateContent,
  } = useSpeech(streamingContent, {
    onSpeechStart: () => console.log("Speech started"),
    onSpeechDone: () => console.log("Speech finished"),
    onSpeechError: (error) => console.error("Speech error:", error),
  });

  const handleStartStream = async () => {
    streamResponse({
      apiKey: (await getManagedAPIKey()) || apiKey,
      messages: [
        {
          role: "user",
          content: "Hi, tell me a veryyyy short story. Like 50 words or less.",
        },
      ],
    });
  };

  useEffect(() => {
    if (streamingContent.length) {
      updateContent(streamingContent);
    }
  }, [streamingContent]);

  return (
    <View>
      <Button
        title="TTS Settings"
        onPress={() => startActivityAsync("com.android.settings.TTS_SETTINGS")}
      />
      <Button
        title="Start Stream"
        onPress={() => {
          handleStartStream();
          stopSpeech();
          startSpeech([]);
        }}
        disabled={isLoading || isSpeaking}
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
