import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Octokit } from "@octokit/rest";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const token = process.env.GITHUB_PAT;
  if (!token) {
    return NextResponse.json({ error: "Missing GITHUB_PAT" }, { status: 500 });
  }

  try {
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
    });

    const repoList = data.map((r) => ({
      name: r.name,
      fullName: r.full_name,
      defaultBranch: r.default_branch || "main",
      private: r.private,
    }));

    return NextResponse.json({ repos: repoList });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch GitHub repositories" },
      { status: 500 }
    );
  }
}