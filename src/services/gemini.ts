import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getDiagnosis(symptoms: string): Promise<DiagnosisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Analyze the following symptoms and provide a potential diagnosis guidance. 
    SYMPTOMS: ${symptoms}
    
    IMPORTANT: You are an AI, not a doctor. Your response must be structured, cautious, and include a strong disclaimer. 
    Focus on common possibilities but always prioritize safety and professional consultation.
    Include a list of "nextSteps" which should be actionable health guidance, wellness tips, or specific medical advice (like "Consult a specialist" or "Monitor temperature every 4 hours").`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          potentialConditions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                likelihood: { type: Type.STRING, enum: ["Low", "Moderate", "High"] },
                description: { type: Type.STRING },
                commonSymptoms: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "likelihood", "description", "commonSymptoms"]
            }
          },
          severity: { type: Type.STRING, enum: ["Low", "Medium", "High", "Emergency"] },
          recommendation: { type: Type.STRING },
          nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          disclaimer: { type: Type.STRING }
        },
        required: ["potentialConditions", "severity", "recommendation", "nextSteps", "disclaimer"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as DiagnosisResult;
  } catch (error) {
    console.error("Failed to parse diagnosis result:", error);
    throw new Error("Failed to analyze symptoms. Please try again.");
  }
}
