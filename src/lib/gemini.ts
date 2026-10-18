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
You are an expert Senior Full-Stack Architect & AI Agent assisting a developer in Mughis Mobile Studio.
Your goal is to provide a detailed, highly articulate, thorough, and helpful engineering explanation alongside complete working code.

CRITICAL RULES:
1. Always return the COMPLETE, fully working code. NEVER use placeholders such as "// TODO", "// add code here", or "... unchanged code ...".
2. Respond strictly in JSON format matching this schema:
{
  "explanation": "A detailed, thorough, senior-architect-level explanation in polite Indonesian clearly outlining: 1) What exact changes were made in the code, 2) Why these architectural decisions were taken, 3) Key improvements (performance, readability, security, or UI/UX), and 4) Clear guidance on how the code works.",
  "fullUpdatedCode": "The complete modified source code from line 1 to the end without any missing parts or placeholders."
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
      temperature: 0.3,
    },
  });

  const responseText = response.text || "";
  try {
    const parsed = JSON.parse(responseText);
    return {
      explanation: parsed.explanation || "Perubahan kode telah berhasil diterapkan oleh Gemini AI Agent.",
      fullUpdatedCode: parsed.fullUpdatedCode || currentCode,
    };
  } catch (error) {
    throw new Error(`Failed to parse Gemini response as JSON: ${responseText}`);
  }
}