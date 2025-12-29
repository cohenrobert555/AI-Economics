
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private getClient() {
    // window.process를 통해 안전하게 API 키 접근
    const apiKey = (window as any).process?.env?.API_KEY || "";
    return new GoogleGenAI({ apiKey });
  }

  async suggestSEO(content: string) {
    try {
      const ai = this.getClient();
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
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Error:", error);
      return null;
    }
  }

  async generateDraft(topic: string) {
    try {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a short professional economic consulting bio or summary about: ${topic}. Format as a clear narrative.`,
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
