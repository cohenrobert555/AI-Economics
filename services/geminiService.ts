
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    // Safely check for process.env to avoid crashing in browser environments
    const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async suggestSEO(content: string) {
    if (!this.ai) return null;
    try {
      const response = await this.ai.models.generateContent({
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
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Error:", error);
      return null;
    }
  }

  async generateDraft(topic: string) {
    if (!this.ai) return null;
    try {
      const response = await this.ai.models.generateContent({
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
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Error:", error);
      return null;
    }
  }
}

export const gemini = new GeminiService();