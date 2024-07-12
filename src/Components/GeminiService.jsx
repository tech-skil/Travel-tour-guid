// src/services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Use the appropriate way to access environment variables based on your setup
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("Gemini API key not found. Please check your environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

let chat;

export const initializeChat = () => {
  chat = model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 500,
    },
  });
};

export const sendMessage = async (message) => {
  if (!chat) {
    initializeChat();
  }
  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text();
};