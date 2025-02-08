"use client";

import { useState } from "react";
import ChatInput from "~~/components/chat/chat-input";
import ChatMessages from "~~/components/chat/chat-message";
import OutputArea from "~~/components/chat/output-area";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `This is a simulated response to: "${input}"`,
        role: "assistant",
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="grid grid-cols-2 h-screen">
      {/* Chat Interface - Left Column */}
      <div className="flex flex-col border-r">
        <div className="flex-1 overflow-auto p-4">
          <ChatMessages messages={messages} isLoading={isLoading} />
        </div>
        <div className="border-t bg-base-200 p-4">
          <ChatInput input={input} setInput={setInput} handleSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>

      {/* Output Area - Right Column */}
      <div className="bg-base-200">
        <OutputArea messages={messages} />
      </div>
    </div>
  );
}
