// src/services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("Gemini API key not found.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 500,
  stopSequences: ["End", "end", "stop", "close"],
};

let chat;

const createPrompt = (userInput) => {
  return `Provide a brief, engaging tour guide for the location mentioned or implied in this query: "${userInput}". Include:
1. Quick history snapshot
2. Top 2-3 must-see attractions
3. One local specialty or unique feature
4. A nearby day-trip suggestion

Keep it concise, friendly , full details, and exciting!`;
};

const isGreeting = (input) => {
  const greetings = ['hi', 'hello', 'hey', 'greetings', 'howdy'];
  return greetings.some(greeting => input.toLowerCase().includes(greeting));
};

export const initializeChat = () => {
  chat = model.startChat({
    generationConfig,
    history: [],
  });
};

export const sendMessage = async (userInput) => {
  if (!chat) {
    initializeChat();
  }

  if (isGreeting(userInput)) {
    return "Hello! \n I'm Triplo, your travel buddy! How can i help you? ";
  }

  const prompt = createPrompt(userInput);
  const result = await chat.sendMessage(prompt);
  return result.response.text();
};