import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchFileContent, commitAndPushFile } from "@/lib/github";
import { processCodeModificationWithGemini } from "@/lib/gemini";
import { AIAssistResponse } from "@/types";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { message, selectedFile, selectedModel, targetRepo } = body;

    if (!message || !selectedFile) {
      return NextResponse.json(
        { error: "Message and selectedFile are required fields." },
        { status: 400 }
      );
    }

    const owner = process.env.TARGET_REPO_OWNER || "agya1806-blip";
    const repo = targetRepo || process.env.TARGET_REPO_NAME || "CLOUDFLARE_API_TOKEN";
    const branch = process.env.TARGET_REPO_BRANCH || "main";

    const { content: originalContent } = await fetchFileContent(owner, repo, selectedFile, branch);

    const modelToUse = selectedModel || "gemini-2.5-flash";

    const { explanation, fullUpdatedCode } = await processCodeModificationWithGemini(
      selectedFile,
      originalContent,
      message,
      modelToUse
    );

    const commitMsg = `AI Edit (${selectedFile}) [${modelToUse}]: ${message.slice(0, 40)}`;
    const { commitSha, commitUrl } = await commitAndPushFile(
      owner,
      repo,
      selectedFile,
      fullUpdatedCode,
      commitMsg,
      branch
    );

    const responsePayload: AIAssistResponse = {
      explanation,
      targetFile: selectedFile,
      originalContent,
      modifiedContent: fullUpdatedCode,
      commitSha,
      commitUrl,
      status: "success",
    };

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Failed to process AI code editor command",
        status: "error",
      },
      { status: 500 }
    );
  }
}