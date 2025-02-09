import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FAST_API,
});

export const endpoints = {
  chat: "/chat",
};

export default api;
