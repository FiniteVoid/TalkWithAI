// useSpeech.ts
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

const useSpeech = (content: string[], options: UseSpeechOptions = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const contentRef = useRef<string[]>([]);
  const {
    rate = 1.0,
    pitch = 1.0,
    language = "en-US",
    onSpeechStart,
    onSpeechDone,
    onSpeechError,
  } = options;

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const speakNextChunk = useCallback(() => {
    if (currentIndex < contentRef.current.length) {
      const chunk = contentRef.current[currentIndex];
      setIsSpeaking(true);
      onSpeechStart?.();

      Speech.speak(chunk, {
        rate,
        pitch,
        language,
        onDone: () => {
          setCurrentIndex((prev) => prev + 1);
          setIsSpeaking(false);
        },
        onError: (error) => {
          console.error("Speech error:", error);
          setIsSpeaking(false);
          onSpeechError?.(error);
        },
      });
    } else if (
      currentIndex === contentRef.current.length &&
      contentRef.current.length > 0
    ) {
      setIsStarted(false);
      onSpeechDone?.();
    }
  }, [
    currentIndex,
    rate,
    pitch,
    language,
    onSpeechStart,
    onSpeechError,
    onSpeechDone,
  ]);

  useEffect(() => {
    if (isStarted && !isSpeaking && contentRef.current.length > currentIndex) {
      speakNextChunk();
    }
  }, [isStarted, isSpeaking, speakNextChunk, currentIndex, content]);

  useEffect(() => {
    const getVoices = async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        console.log(voices);
      } catch (error) {
        console.error("Error fetching voices:", error);
      }
    };

    getVoices();
  }, []);

  const startSpeech = useCallback(() => {
    setIsStarted(true);
    setCurrentIndex(0);
  }, []);

  const pauseSpeech = useCallback(() => {
    Speech.pause();
    setIsSpeaking(false);
  }, []);

  const resumeSpeech = useCallback(() => {
    if (isStarted) {
      Speech.resume();
      setIsSpeaking(true);
    }
  }, [isStarted]);

  const stopSpeech = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
    setIsStarted(false);
    setCurrentIndex(0);
  }, []);

  return {
    isSpeaking,
    isStarted,
    startSpeech,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
  };
};

export default useSpeech;
