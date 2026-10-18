import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchRepositoryTree } from "@/lib/github";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const repoParam = searchParams.get("repo");

  const owner = process.env.TARGET_REPO_OWNER || "agya1806-blip";
  const repo = repoParam || process.env.TARGET_REPO_NAME || "CLOUDFLARE_API_TOKEN";
  const branch = process.env.TARGET_REPO_BRANCH || "main";

  try {
    const tree = await fetchRepositoryTree(owner, repo, branch);
    const filesOnly = tree.filter((item) => item.type === "blob");
    return NextResponse.json({ tree: filesOnly, owner, repo, branch });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch repository tree" },
      { status: 500 }
    );
  }
}