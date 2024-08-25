import React, { useEffect, useReducer, useCallback } from "react";
import { View } from "react-native";
import { Dialog, DialogContent, DialogFooter } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { X } from "~/lib/icons/X";
import { Pause } from "~/lib/icons/Pause";
import { Play } from "~/lib/icons/Play";
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
} from "react-native-reanimated";
import useSpeech from "~/src/services/speech";
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from "@wdragon/react-native-voice";
import { Text } from "../text";

// State and Action types
type State =
  | "IDLE"
  | "LISTENING_START"
  | "LISTENING"
  | "LISTENING_DONE"
  | "SENDING"
  | "RECEIVING"
  | "SPEAKING_START"
  | "SPEAKING"
  | "SPEAKING_DONE"
  | "ERROR";

type Action =
  | { type: "START_LISTENING" }
  | { type: "LISTENING_STARTED" }
  | { type: "LISTENING_COMPLETED" }
  | { type: "SEND_TO_PARENT" }
  | { type: "RECEIVE_FROM_PARENT" }
  | { type: "START_SPEAKING" }
  | { type: "UPDATE_SPEECH" }
  | { type: "FINISH_SPEAKING" }
  | { type: "ERROR"; payload: string };

// Reducer function
function voiceReducer(state: State, action: Action): State {
  // console.log("AID:", state, action);
  switch (state) {
    case "IDLE":
      if (action.type === "START_LISTENING") return "LISTENING_START";
      break;
    case "LISTENING_START":
      if (action.type === "LISTENING_STARTED") return "LISTENING";
      break;
    case "LISTENING":
      if (action.type === "LISTENING_COMPLETED") return "LISTENING_DONE";
      break;
    case "LISTENING_DONE":
      if (action.type === "SEND_TO_PARENT") return "SENDING";
      break;
    case "SENDING":
      if (action.type === "RECEIVE_FROM_PARENT") return "RECEIVING";
      break;
    case "RECEIVING":
      if (action.type === "START_SPEAKING") return "SPEAKING_START";
      break;
    case "SPEAKING_START":
    case "SPEAKING":
      if (action.type === "UPDATE_SPEECH") return "SPEAKING";
      if (action.type === "FINISH_SPEAKING") return "SPEAKING_DONE";
      break;
    case "SPEAKING_DONE":
      if (action.type === "START_LISTENING") return "LISTENING_START";
      break;
  }
  if (action.type === "ERROR") return "ERROR";
  // console.log("End:", state, action);
  return state;
}

interface VoiceModeDialogProps {
  streamData: {
    streamingContent: string[];
    isLoading: boolean;
    error: any;
    onSend: (text: string) => void;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceModeDialog({
  isOpen,
  onClose,
  streamData,
}: VoiceModeDialogProps) {
  const [state, dispatch] = useReducer(voiceReducer, "IDLE");
  const {
    isSpeaking,
    isStarted,
    isDone: isDoneSpeaking,
    startSpeech,
    stopSpeech,
    pauseSpeech,
    updateContent,
  } = useSpeech();

  const scale = useSharedValue(1);
  const [isPaused, setIsPaused] = React.useState(false);
  const [listeningResults, setListeningResults] = React.useState<string[]>([]);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(scale.value * 1.15, { duration: 1400 }),
      -1,
      true
    );
  }, []);

  const handleStart = useCallback(async () => {
    try {
      await Voice.start("en-US", {});
      dispatch({ type: "LISTENING_STARTED" });
    } catch (e) {
      console.error(e);
      dispatch({ type: "ERROR", payload: "Failed to start listening" });
    }
  }, []);

  const handleStop = useCallback(async () => {
    try {
      await Voice.stop();
      dispatch({ type: "LISTENING_COMPLETED" });
    } catch (e) {
      console.error(e);
      dispatch({ type: "ERROR", payload: "Failed to stop listening" });
    }
  }, []);

  const handlePausePlay = useCallback(async () => {
    stopSpeech();
    if (isPaused) {
      handleStart();
      setIsPaused(false);
    } else {
      handleStop();
      setIsPaused(true);
    }
  }, [isPaused, handleStart, handleStop, stopSpeech]);

  useEffect(() => {
    function onSpeechResults(e: SpeechResultsEvent) {
      setListeningResults(e.value ?? []);
    }

    function onSpeechStart(e: any) {
      dispatch({ type: "LISTENING_STARTED" });
    }

    function onSpeechEnd(e: any) {
      dispatch({ type: "LISTENING_COMPLETED" });
    }

    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "START_LISTENING" });
    } else {
      handleStop();
      stopSpeech();
    }
  }, [isOpen, handleStop, stopSpeech]);

  useEffect(() => {
    if (isDoneSpeaking) {
      stopSpeech();
      dispatch({ type: "FINISH_SPEAKING" });
    }
  }, [isDoneSpeaking]);

  useEffect(() => {
    if (streamData.isLoading && streamData.streamingContent.length > 0) {
      dispatch({ type: "RECEIVE_FROM_PARENT" });
      console.log("Received from parent:", streamData.streamingContent);
      startSpeech(streamData.streamingContent);
      // Only dispatch START_SPEAKING if we haven't started speaking yet
      if (state === "RECEIVING") {
        dispatch({ type: "START_SPEAKING" });
      }
    }
  }, [streamData.isLoading, streamData.streamingContent, state]);

  useEffect(() => {
    if (streamData.streamingContent.length > 0) {
      updateContent(streamData.streamingContent);
      if (state === "SPEAKING") {
        dispatch({ type: "UPDATE_SPEECH" });
      }
    }
  }, [streamData.streamingContent, updateContent, state]);

  useEffect(() => {
    console.log("State:", state);
  }, [state]);

  // useEffect(() => {
  //   console.log("Streaming content:", streamData.streamingContent);
  // }, [streamData.streamingContent]);

  useEffect(() => {
    // console.log("Start:", state);
    switch (state) {
      case "LISTENING_START":
        handleStart();
        break;
      case "LISTENING_DONE":
        if (
          listeningResults.length > 0 &&
          listeningResults[listeningResults.length - 1] !== ""
        ) {
          streamData.onSend(listeningResults[listeningResults.length - 1]);
          dispatch({ type: "SEND_TO_PARENT" });
        } else {
          dispatch({ type: "START_LISTENING" });
        }
        break;
      case "SPEAKING_START":
        startSpeech(streamData.streamingContent);
        dispatch({ type: "UPDATE_SPEECH" });
        break;
      case "SPEAKING_DONE":
        console.log("Finished speaking!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        setListeningResults([]);
        dispatch({ type: "START_LISTENING" });
        break;
      case "ERROR":
        // Handle error state, maybe show an error message to the user
        console.error("An error occurred in the voice interaction");
        break;
    }
  }, [state, listeningResults, streamData, handleStart, startSpeech]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="h-full w-screen flex justify-center items-center bg-background !p-0 borde-0 rounded-none"
        showX={false}
        overlayOpacity={100}
      >
        {isPaused && (
          <View
            className={`w-[19rem] h-[19rem] rounded-full border-[10px] border-foreground/70 `}
          />
        )}
        <Animated.View style={{ transform: [{ scale }] }} className="relative">
          {!isPaused && (
            <Button
              className="!w-[18rem] !h-[18rem] rounded-full"
              onPress={handlePausePlay}
            />
          )}
          <Text className="text-center w-full p-2">
            {listeningResults.length > 0 &&
              listeningResults[listeningResults.length - 1]}
          </Text>
        </Animated.View>
        <DialogFooter className="!p-0 absolute bottom-16 justify-around flex-row w-full">
          <Button
            className="!h-16 rounded-full "
            variant={"secondary"}
            onPress={handlePausePlay}
          >
            {isPaused ? (
              <Play size={24} className="text-foreground fill-foreground" />
            ) : (
              <Pause size={24} className="text-foreground fill-foreground" />
            )}
          </Button>
          <Button
            className="!h-16 rounded-full"
            onPress={onClose}
            variant={"destructive"}
          >
            <X size={24} className="text-white" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
