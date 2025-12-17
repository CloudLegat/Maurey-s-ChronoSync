import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult } from "../types";

const apiKey = process.env.API_KEY;

// Only initialize if key is present to prevent startup errors
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const searchCityTimezone = async (query: string): Promise<SearchResult | null> => {
  if (!query) return null;

  // If no API key is provided, return null gracefully.
  // The UI will handle this by showing the default city list or an error.
  if (!ai) {
    console.warn("Gemini API key is missing. Search functionality is disabled.");
    return null;
  }

  try {
    const prompt = `Identify the city and its timezone from this query: "${query}". Return the correct IANA timezone ID.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "The common name of the city" },
            timezone: { type: Type.STRING, description: "The IANA timezone identifier (e.g., Europe/London)" },
            country: { type: Type.STRING, description: "The country name" }
          },
          required: ["name", "timezone", "country"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text) as SearchResult;
  } catch (error) {
    console.error("Error fetching city data:", error);
    return null;
  }
};