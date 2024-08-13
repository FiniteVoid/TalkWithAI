import React, { useState, useEffect } from "react";
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
import { Button } from "../button";

interface ChatInterfaceProps {
  sessionId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId }) => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    sessionId || null
  );

  useEffect(() => {
    if (sessionId) {
      loadExistingSession(sessionId);
    }
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
      await addMessage(sid, "USER", text);
      setMessages((prevMessages) => [...prevMessages, { text, isUser: true }]);

      // Placeholder for AI response
      // In the future, replace this with actual AI API call
      setTimeout(async () => {
        const aiResponse = "This is an AI response";
        await addMessage(sid, "ASSISTANT", aiResponse);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: aiResponse, isUser: false },
        ]);
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Card className="w-full h-full p-2 border-0 backdrop-blur-sm bg-background/40 pt-0">
      <CardContent className="flex-1 p-0 mt-0 pt-0 justify-center items-center">
        {messages.length !== 0 ? (
          <MessageList messages={messages} />
        ) : (
          <Button className="rounded-full px-0 p-6 !h-14 !w-14">
            <LoaderPinwheel className="text-background" size={32} />
          </Button>
        )}
      </CardContent>
      <CardFooter className="px-2 -mb-6 mt-2">
        <InputArea onSend={handleSend} />
      </CardFooter>
    </Card>
  );
};
