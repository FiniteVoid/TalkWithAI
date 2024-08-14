import { ScrollView, View, Text, Touchable } from "react-native";
import { Button } from "../button";
import { Input } from "../input";
import { useState } from "react";
import { LoaderPinwheel } from "~/lib/icons/LoaderPinwheel";
import { TouchableOpacity } from "react-native-gesture-handler";
import useSpeech from "~/src/services/speech";
import { splitIntoSentences } from "~/src/utils/splitIntoSentence";
import { Volume1 } from "~/lib/icons/Volume1";
import { VolumeX } from "~/lib/icons/VolumeX";
export interface MessageProps {
  text: string;
  isUser: boolean;
  isStreaming?: boolean;
}

// Message.tsx

export const Message: React.FC<MessageProps> = ({
  text,
  isUser,
  isStreaming,
}) => {
  const { isSpeaking, pauseSpeech, resumeSpeech, stopSpeech, startSpeech } =
    useSpeech([], {
      onSpeechStart: () => console.log("Speech started"),
      onSpeechDone: () => console.log("Speech finished"),
      onSpeechError: (error) => console.error("Speech error:", error),
    });
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="w-full p-0 m-0"
      touchSoundDisabled={true}
    >
      <View
        className={`rounded-lg  mb-8 flex flex-row gap-3 ${
          isUser ? "p-3 bg-blue-500 self-end" : "bg-transparent self-start"
        }`}
      >
        {!isUser && (
          <Button
            className="rounded-full px-0 !p-0 !h-12 !w-12"
            android_disableSound={true}
          >
            <LoaderPinwheel className="text-background" size={24} />
          </Button>
        )}
        <Text
          className={`${
            isUser ? `text-white` : `text-foreground mt-3 w-max pr-20`
          }`}
        >
          {text}
        </Text>
        {isStreaming && <Text className="text-foreground mt-3">...</Text>}
      </View>
      {!isStreaming && !isUser && (
        <Button
          onPress={() => {
            if (!isStreaming && !isUser) {
              if (isSpeaking) {
                stopSpeech();
              } else {
                startSpeech(splitIntoSentences(text));
              }
            }
          }}
          variant={"ghost"}
          className=" rounded-full !w-12 !h-12 !p-0 absolute left-[3rem] bottom-[-0.5rem]"
        >
          {isSpeaking ? (
            <VolumeX className="text-foreground" size={16} />
          ) : (
            <Volume1 className="text-foreground" size={16} />
          )}
        </Button>
      )}
    </TouchableOpacity>
  );
};
