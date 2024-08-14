import React, { useState, useEffect, useCallback } from "react";
import { MessageProps } from "./message";
import { MessageList } from "./messageList";
import { InputArea } from "./inputArea";
import { Card, CardContent, CardFooter } from "../card";
import {
  createChatSession,
  getChatSessionWithMessages,
  addMessage,
} from "~/db/services";
import { LoaderPinwheel } from "~/lib/icons/LoaderPinwheel";
import { CircleAlert } from "~/lib/icons/CircleAlert";
import { Button } from "../button";
import useAnthropicStream from "~/src/adapters/anthropic";
import { getManagedAPIKey } from "~/src/services/keyManagement";
import { set } from "react-hook-form";
import { VoiceModeDialog } from "./voiceMode";
import { Label } from "../label";
import { View } from "react-native";
import { Text } from "../text";

interface ChatInterfaceProps {
  sessionId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId }) => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [currentAIResponse, setCurrentAIResponse] = useState<string>("");
  const [currentUserResponse, setCurrentUserResponse] = useState<string>("");
  const [voiceModeOpen, setVoiceModeOpen] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    sessionId || null
  );
  const [apiKey, setApiKey] = useState<string>("");

  const { streamingContent, isLoading, error, streamResponse, stopStream } =
    useAnthropicStream({ apiKey, chunkSize: voiceModeOpen ? -1 : 1 }); // Use sentence-based chunking

  useEffect(() => {
    if (sessionId) {
      loadExistingSession(sessionId);
    }

    const fetchAPIKey = async () => {
      setApiKey((await getManagedAPIKey()) || "");
    };
    fetchAPIKey();
  }, [sessionId]);

  const loadExistingSession = async (sid: string) => {
    try {
      const session = await getChatSessionWithMessages(sid);
      if (session) {
        setCurrentSessionId(session.id);
        setMessages(
          session.messages.map((msg) => ({
            text: msg.data,
            isUser: msg.senderRole === "USER",
          }))
        );
      }
    } catch (error) {
      console.error("Error loading session:", error);
    }
  };

  const createNewSession = async (firstMessage: string) => {
    try {
      const topic = firstMessage.split(" ").slice(0, 5).join(" ");
      const newSession = await createChatSession(topic);
      setCurrentSessionId(newSession.id);
      return newSession.id;
    } catch (error) {
      console.error("Error creating new session:", error);
      return null;
    }
  };

  const handleSend = async (text: string) => {
    let sid = currentSessionId;
    if (!sid) {
      sid = await createNewSession(text);
      if (!sid) return; // Handle error case
    }

    try {
      setMessages((prevMessages) => [...prevMessages, { text, isUser: true }]);
      setCurrentUserResponse(text);

      setCurrentAIResponse(""); // Reset the AI response
      streamResponse({
        apiKey: (await getManagedAPIKey()) || "",
        messages: [
          ...messages.map((msg) => ({
            role: msg.isUser ? "user" : "assistant",
            content: msg.text,
          })),
          {
            role: "user",
            content: text,
          },
        ],
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const updateAIResponse = useCallback((newContent: string) => {
    setCurrentAIResponse((prev) => prev + newContent);
  }, []);

  useEffect(() => {
    if (streamingContent.length > 0) {
      updateAIResponse(streamingContent[streamingContent.length - 1]);
    }
  }, [streamingContent, updateAIResponse]);

  useEffect(() => {
    if (!isLoading && currentAIResponse) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: currentAIResponse, isUser: false },
      ]);
      // Add to db
      let sid = currentSessionId;
      const addMessageToDB = async () => {
        if (!sid) {
          sid = await createNewSession(currentAIResponse);
          if (!sid) return; // Handle error case
        }
      };
      addMessageToDB();
      addMessage(sid!, "USER", currentUserResponse);
      addMessage(sid!, "ASSISTANT", currentAIResponse);
      setCurrentAIResponse(""); // Reset for the next response
      setCurrentUserResponse(""); // Reset for the next response
    }
    if (!isLoading && error !== undefined) {
      // Remove the last message if there was an error
      setMessages((prevMessages) => prevMessages.slice(0, -1));
    }
  }, [isLoading, currentAIResponse]);

  return (
    <Card className="w-full h-full p-2 border-0 backdrop-blur-sm bg-background/40 pt-0">
      <CardContent className="flex-1 p-0 mt-0 pt-0 justify-center items-center">
        {messages.length !== 0 ? (
          <MessageList
            messages={messages}
            currentAIResponse={isLoading ? currentAIResponse : null}
          />
        ) : (
          <Button
            className="rounded-full px-0 p-6 !h-14 !w-14"
            android_disableSound={true}
          >
            <LoaderPinwheel className="text-background" size={32} />
          </Button>
        )}
      </CardContent>
      {isLoading && (
        <View className="flex flex-row gap-2 justify-center items-center  w-full p-8">
          <LoaderPinwheel className="text-accent animate-spin" size={24} />
          <Text className="text-xs text-accent text-center">Loading...</Text>
        </View>
      )}
      {!isLoading && error && (
        <View className="flex flex-row gap-2 justify-center items-center  w-full p-8">
          <CircleAlert className="text-destructive stroke-2" size={24} />
          <Text className="text-xs text-destructive text-center">{error}</Text>
        </View>
      )}
      <CardFooter className="px-2 -mb-6 mt-2">
        <InputArea
          onSend={handleSend}
          onVoiceMode={() => setVoiceModeOpen(true)}
        />
      </CardFooter>
      <VoiceModeDialog
        streamData={{ streamingContent, isLoading, error, onSend: handleSend }}
        isOpen={voiceModeOpen}
        onClose={() => setVoiceModeOpen(false)}
      />
    </Card>
  );
};
