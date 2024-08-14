import { useState, useEffect, useCallback, useRef } from "react";
import * as Speech from "expo-speech";

interface UseSpeechOptions {
  rate?: number;
  pitch?: number;
  language?: string;
  onSpeechStart?: () => void;
  onSpeechDone?: () => void;
  onSpeechError?: (error: any) => void;
}

// Global state to ensure only one instance is active
let globalIsSpeaking = false;
let globalStopFunction: (() => void) | null = null;

const useSpeech = (
  streamingContent: string[] = [],
  options: UseSpeechOptions = {}
) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isDone, setIsDone] = useState<boolean | undefined>(undefined);
  const [currentIndex, setCurrentIndex] = useState(0);
  const contentRef = useRef<string[]>([]);
  const { onSpeechStart, onSpeechDone, onSpeechError } = options;

  const speakNextChunk = useCallback(() => {
    if (currentIndex < contentRef.current.length) {
      const chunk = contentRef.current[currentIndex];
      setIsSpeaking(true);
      setIsDone(false);
      globalIsSpeaking = true;
      onSpeechStart?.();

      Speech.speak(chunk, {
        onDone: () => {
          setCurrentIndex((prev) => prev + 1);
          setIsSpeaking(false);
          setIsDone(true);
          globalIsSpeaking = false;
        },
        onError: (error) => {
          console.error("Speech error:", error);
          setIsSpeaking(false);
          setIsDone(undefined);
          globalIsSpeaking = false;
          onSpeechError?.(error);
        },
      });
    } else if (
      currentIndex === contentRef.current.length &&
      contentRef.current.length > 0
    ) {
      setIsStarted(false);
      setIsDone(true);
      globalIsSpeaking = false;
      onSpeechDone?.();
    }
  }, [currentIndex, onSpeechStart, onSpeechError, onSpeechDone]);

  useEffect(() => {
    if (isStarted && !isSpeaking && contentRef.current.length > currentIndex) {
      speakNextChunk();
    }
  }, [isStarted, isSpeaking, speakNextChunk, currentIndex]);

  const startSpeech = useCallback((content: string[]) => {
    if (globalIsSpeaking) {
      globalStopFunction?.();
    }
    contentRef.current = content;
    setIsStarted(true);
    setCurrentIndex(0);
    globalStopFunction = stopSpeech;
  }, []);

  const pauseSpeech = useCallback(() => {
    Speech.pause();
    setIsSpeaking(false);
    globalIsSpeaking = false;
  }, []);

  const resumeSpeech = useCallback(() => {
    if (isStarted && !globalIsSpeaking) {
      Speech.resume();
      setIsSpeaking(true);
      globalIsSpeaking = true;
    }
  }, [isStarted]);

  const stopSpeech = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
    setIsStarted(false);
    setCurrentIndex(0);
    globalIsSpeaking = false;
    globalStopFunction = null;
  }, []);

  const updateContent = useCallback((newContent: string[]) => {
    contentRef.current = newContent;
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (globalStopFunction === stopSpeech) {
        stopSpeech();
      }
    };
  }, [stopSpeech]);

  return {
    isDone,
    isSpeaking,
    isStarted,
    startSpeech,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
    updateContent,
  };
};

export default useSpeech;
