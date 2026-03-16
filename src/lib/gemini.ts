import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async suggestReply(message: string) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Suggest 3 short, friendly, and natural replies to this message: "${message}". Return only the replies separated by newlines.`,
      });
      return response.text?.split('\n').filter(r => r.trim()) || [];
    } catch (error) {
      console.error("Gemini error:", error);
      return [];
    }
  },
  
  async improveAudioTranscript(transcript: string) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Correct any errors in this voice-to-text transcript and make it more readable while keeping the original meaning: "${transcript}"`,
      });
      return response.text || transcript;
    } catch (error) {
      console.error("Gemini error:", error);
      return transcript;
    }
  }
};
