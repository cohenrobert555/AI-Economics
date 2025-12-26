
import { GoogleGenAI, Type } from "@google/genai";

// Always initialize the client using the environment variable as per coding guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class GeminiService {
  async suggestSEO(content: string) {
    try {
      // Use ai.models.generateContent directly with model name and prompt
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given the following content, suggest 5 highly relevant SEO keywords and a 160-character meta description. Content: ${content}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              metaDescription: { type: Type.STRING }
            },
            required: ['keywords', 'metaDescription']
          }
        }
      });
      // Access text property directly as it is a getter
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Error:", error);
      return null;
    }
  }

  async generateDraft(topic: string) {
    try {
      // Use ai.models.generateContent directly with model name and prompt
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a short professional economic consulting blog post about: ${topic}. Include a title and a 3-sentence excerpt.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              excerpt: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ['title', 'excerpt', 'content']
          }
        }
      });
      // Access text property directly as it is a getter
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Error:", error);
      return null;
    }
  }
}

export const gemini = new GeminiService();
