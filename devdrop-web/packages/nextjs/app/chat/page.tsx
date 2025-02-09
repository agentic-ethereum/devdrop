"use client";

import { useState } from "react";
import ChatInput from "~~/components/chat/chat-input";
import ChatMessages from "~~/components/chat/chat-message";
import OutputArea from "~~/components/chat/output-area";
import { useChat } from "~~/lib/chat";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const chatMutation = useChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    console.log(input);

    try {
      const response = await chatMutation.mutateAsync(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content || response,
        role: "assistant",
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, there was an error processing your request.",
        role: "assistant",
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="grid grid-cols-2 h-screen-nav">
      <div className="flex flex-col border-r">
        <div className="flex-1 overflow-auto p-4">
          <ChatMessages messages={messages} isLoading={chatMutation.isPending} />
        </div>
        <div className="border-t bg-base-200 p-4">
          <ChatInput input={input} setInput={setInput} handleSubmit={handleSubmit} isLoading={chatMutation.isPending} />
        </div>
      </div>
      <div className="bg-base-200">
        <OutputArea messages={messages} />
      </div>
    </div>
  );
}
