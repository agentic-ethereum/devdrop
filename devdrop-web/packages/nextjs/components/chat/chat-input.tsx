import React, { FormEvent } from "react";
import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export default function ChatInput({ input, setInput, handleSubmit, isLoading }: ChatInputProps) {
  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="form-control">
        <div className="relative">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="textarea textarea-bordered w-full pr-12 min-h-[60px] resize-none"
            rows={2}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-circle btn-primary absolute right-2 top-1/2 -translate-y-1/2"
          >
            <SendHorizontal size={18} />
          </button>
        </div>
        <label className="label">
          <span className="label-text-alt text-base-content/60">Press Enter to send, Shift + Enter for new line</span>
        </label>
      </div>
    </form>
  );
}
