import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client using the environment variable
// The AI Studio environment automatically handles the GEMINI_API_KEY secret
export const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};
