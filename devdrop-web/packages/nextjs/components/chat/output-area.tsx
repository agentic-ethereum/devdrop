import { Code2, Copy } from "lucide-react";
import { Message } from "~~/app/chat/page";

interface OutputAreaProps {
  messages: Message[];
}

export default function OutputArea({ messages }: OutputAreaProps) {
  const lastAssistantMessage = messages.filter(m => m.role === "assistant").pop();

  const copyToClipboard = () => {
    if (lastAssistantMessage) {
      navigator.clipboard.writeText(lastAssistantMessage.content);
    }
  };

  return (
    <div className="h-full p-6">
      <div className="card bg-base-100 h-full">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title flex items-center gap-2">
              <Code2 size={20} />
              Output Preview
            </h2>
            {lastAssistantMessage && (
              <button className="btn btn-ghost btn-sm" onClick={copyToClipboard}>
                <Copy size={16} />
                Copy
              </button>
            )}
          </div>
          <div className="mockup-code mt-4">
            {lastAssistantMessage ? (
              <pre className="px-4 py-2">
                <code>{lastAssistantMessage.content}</code>
              </pre>
            ) : (
              <pre className="px-4 py-2 text-base-content/60">
                <code>Your output will appear here...</code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
