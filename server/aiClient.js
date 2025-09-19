import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY;
const groqApiKey = process.env.GROQ_API_KEY;

let geminiClient = null;
let groqClient = null;

if (geminiApiKey) {
  geminiClient = new GoogleGenerativeAI(geminiApiKey);
  console.log("Google Gemini client initialized successfully.");
} else {
  console.warn("GEMINI_API_KEY is not set. Gemini client not initialized.");
}

if (groqApiKey) {
  groqClient = new OpenAI({
    apiKey: groqApiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
  console.log("Groq client initialized successfully.");
} else {
  console.warn("GROQ_API_KEY is not set. Groq client not initialized.");
}

const clients = {
  gemini: geminiClient,
  groq: groqClient,
};

/**
 * @param {string} provider
 * @returns {GoogleGenerativeAI | OpenAI | null}
 */
export function getAiClient(provider = 'gemini') {
  return clients[provider] || null;
}

/**
 * @param {string} provider
 * @returns {boolean}
 */
export function isProviderAvailable(provider) {
  return !!clients[provider];
}
