import api, { endpoints } from "./api";
import { useMutation } from "@tanstack/react-query";

export function useChat() {
  return useMutation({
    mutationFn: async (message: string) => {
      const { data } = await api.post(endpoints.chat, {
        messages: [
          {
            role: "human",
            content: message,
          },
        ],
      });
      return data.response;
    },
  });
}
