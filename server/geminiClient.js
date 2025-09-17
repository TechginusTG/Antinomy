import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log("Google Gemini client initialized successfully.");
} else {
  console.error("GEMINI_API_KEY is not set in the .env file. Gemini client not initialized.");
}

export default genAI;
