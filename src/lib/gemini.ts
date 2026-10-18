import { GoogleGenAI } from "@google/genai";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable on server.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function processCodeModificationWithGemini(
  filePath: string,
  currentCode: string,
  userInstruction: string,
  modelName: string = "gemini-2.5-flash"
): Promise<{ explanation: string; fullUpdatedCode: string }> {
  const ai = getGeminiClient();

  const systemInstruction = `
You are an expert Senior Full-Stack Architect & Android Studio AI Agent.
Your task is to modify the code of the target file based on the user's instructions.
CRITICAL RULES:
1. Always return the COMPLETE, fully working code. NEVER use placeholders such as "// TODO", "// add code here", or "... unchanged code ...".
2. Respond strictly in JSON format matching this schema:
{
  "explanation": "A concise explanation in Indonesian summarizing what changes were made and why.",
  "fullUpdatedCode": "The complete modified source code from line 1 to the end."
}
3. Maintain existing formatting, imports, and architectural patterns of the repository.
`;

  const userPrompt = `
Target File Path: ${filePath}

=== CURRENT FILE CODE START ===
${currentCode}
=== CURRENT FILE CODE END ===

User Instruction: ${userInstruction}
`;

  const validModel = modelName || "gemini-2.5-flash";

  const response = await ai.models.generateContent({
    model: validModel,
    contents: userPrompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const responseText = response.text || "";
  try {
    const parsed = JSON.parse(responseText);
    return {
      explanation: parsed.explanation || "Perubahan telah berhasil diterapkan oleh Gemini AI.",
      fullUpdatedCode: parsed.fullUpdatedCode || currentCode,
    };
  } catch (error) {
    throw new Error(`Failed to parse Gemini response as JSON: ${responseText}`);
  }
}