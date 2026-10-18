import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchFileContent } from "@/lib/github";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
  }

  const owner = process.env.TARGET_REPO_OWNER || "agya1806-blip";
  const repo = process.env.TARGET_REPO_NAME || "CLOUDFLARE_API_TOKEN";
  const branch = process.env.TARGET_REPO_BRANCH || "main";

  try {
    const { content, sha } = await fetchFileContent(owner, repo, filePath, branch);
    return NextResponse.json({ path: filePath, content, sha });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch file content" },
      { status: 500 }
    );
  }
}