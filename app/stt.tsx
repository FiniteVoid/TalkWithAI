import React, { useState, useEffect } from "react";
import { View } from "react-native";
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from "@wdragon/react-native-voice";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

const VoiceTest: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);

  useEffect(() => {
    function onSpeechResults(e: SpeechResultsEvent) {
      setResults(e.value ?? []);
    }

    function onSpeechStart(e: any) {
      setIsListening(true);
    }

    function onSpeechEnd(e: any) {
      setIsListening(false);
    }

    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onStartButtonPress = async () => {
    try {
      await Voice.start("en-US");
    } catch (e) {
      console.error(e);
    }
  };

  const onStopButtonPress = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View>
      <Button onPress={onStartButtonPress}>
        <Text>Start Listening</Text>
      </Button>
      <Button onPress={onStopButtonPress}>
        <Text>Stop Listening</Text>
      </Button>
      <Text>Results:</Text>
      {results.map((result, index) => (
        <Text key={`result-${index}`}>{result}</Text>
      ))}
    </View>
  );
};

export default VoiceTest;
