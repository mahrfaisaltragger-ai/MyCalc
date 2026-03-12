import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function processMathQuery(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Convert the following natural language mathematical query into a mathjs-compatible expression or provide the direct result if it's a complex word problem. 
      Query: "${query}"
      
      Return ONLY a JSON object with the following structure:
      {
        "expression": "the mathematical expression to evaluate",
        "explanation": "a brief explanation of what was calculated",
        "result": "the final numerical result (optional if expression is provided)"
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            expression: { type: Type.STRING },
            explanation: { type: Type.STRING },
            result: { type: Type.STRING },
          },
          required: ["expression", "explanation"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Math Error:", error);
    throw new Error("Failed to process AI query");
  }
}
