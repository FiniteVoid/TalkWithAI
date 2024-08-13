import { useState, useCallback, useRef, useEffect } from "react";

interface ContentBlock {
  index: number;
  content: string;
}

interface StreamEvent {
  type: string;
  index?: number;
  delta?: {
    type: string;
    text?: string;
    partial_json?: string;
  };
}

const useAnthropicStream = ({
  apiKey,
  chunkSize = 1,
}: {
  apiKey: string;
  chunkSize: number;
}) => {
  const [streamingContent, setStreamingContent] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const seenBytesRef = useRef<number>(0);
  const bufferRef = useRef<string>("");

  const splitIntoSentences = (text: string): string[] => {
    return text.match(/[^.!?]+[.!?]+/g) || [];
  };

  const processBuffer = useCallback(() => {
    if (chunkSize === -1) {
      const sentences = splitIntoSentences(bufferRef.current);
      if (sentences.length > 0) {
        setStreamingContent((prev) => [...prev, ...sentences]);
        bufferRef.current = bufferRef.current.slice(sentences.join("").length);
      }
    } else {
      setStreamingContent((prev) => [...prev, bufferRef.current]);
      bufferRef.current = "";
    }
  }, [chunkSize]);

  const streamResponse = useCallback(
    ({
      messages,
      model = "claude-3-5-sonnet-20240620",
      maxTokens,
    }: {
      messages: { role: string; content: string }[];
      model: string;
      maxTokens: number;
    }) => {
      setIsLoading(true);
      setError(undefined);
      setStreamingContent([]);
      bufferRef.current = "";
      let tokenCount = 0;

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      seenBytesRef.current = 0;

      xhr.open("POST", "https://api.anthropic.com/v1/messages", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("X-API-Key", apiKey);
      xhr.setRequestHeader("anthropic-version", "2023-06-01");

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 3) {
          // Processing chunked data
          const newData = xhr.responseText.substr(seenBytesRef.current);
          seenBytesRef.current = xhr.responseText.length;

          const lines = newData.split("\n");
          lines.forEach((line) => {
            if (line.trim().startsWith("data: ")) {
              const data = line.trim().slice(6);
              try {
                const event: StreamEvent = JSON.parse(data);
                if (event.delta?.text) {
                  bufferRef.current += event.delta.text;
                  tokenCount++;
                  if (chunkSize === -1 || tokenCount % chunkSize === 0) {
                    processBuffer();
                  }
                }
              } catch (err) {
                console.error("Error parsing chunked data:", err);
              }
            }
          });
        } else if (xhr.readyState === 4) {
          // Request completed
          processBuffer(); // Process any remaining content in the buffer
          setIsLoading(false);
          if (xhr.status !== 200) {
            setError(`HTTP error ${xhr.status}: ${xhr.statusText}`);
          }
        }
      };

      xhr.onerror = function () {
        setError("Network error");
        setIsLoading(false);
      };

      xhr.send(
        JSON.stringify({
          messages,
          model,
          max_tokens: maxTokens,
          stream: true,
        })
      );

      return () => xhr.abort();
    },
    [apiKey, chunkSize, processBuffer]
  );

  useEffect(() => {
    return () => xhrRef.current?.abort();
  }, []);

  const stopStream = useCallback(() => {
    xhrRef.current?.abort();
    setIsLoading(false);
  }, []);

  return {
    streamingContent,
    isLoading,
    error,
    streamResponse,
    stopStream,
  };
};

export default useAnthropicStream;
