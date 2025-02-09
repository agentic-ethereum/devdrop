import { Bot, User } from "lucide-react";
import { Message } from "~~/app/chat/page";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <div className="flex flex-col gap-4">
      {messages.map(message => (
        <div key={message.id} className={`chat ${message.role === "user" ? "chat-end" : "chat-start"}`}>
          <div className="w-10 p-4 rounded-full bg-neutral flex items-center justify-center text-neutral-content">
            {message.role === "user" ? <User size={20} /> : <Bot size={20} />}
          </div>
          {message.content.includes("list of contributors") && (
            <button className="btn btn-primary btn-sm">
              <a href="/output-area">View Contributors</a>
            </button>
          )}
          <div className="chat-header mb-1">{message.role === "user" ? "You" : "AI"}</div>
          <div className="chat-bubble">{message.content}</div>
        </div>
      ))}
      {isLoading && (
        <div className="chat chat-start">
          <div className="w-10 rounded-full bg-neutral flex items-center justify-center text-neutral-content">
            <Bot size={20} />
          </div>
          <div className="chat-header mb-1">AI</div>
          <div className="chat-bubble">
            <span className="loading loading-dots loading-sm"></span>
          </div>
        </div>
      )}
    </div>
  );
}
