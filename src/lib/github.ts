import { Octokit } from "@octokit/rest";
import { GitHubFileNode } from "@/types";

function getOctokit() {
  const token = process.env.GITHUB_PAT;
  if (!token) {
    throw new Error("Missing GITHUB_PAT environment variable on server.");
  }
  return new Octokit({ auth: token });
}

export async function fetchRepositoryTree(
  owner: string,
  repo: string,
  branch: string = "main"
): Promise<GitHubFileNode[]> {
  const octokit = getOctokit();

  const { data: refData } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });

  const treeSha = refData.object.sha;

  const { data: treeData } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: treeSha,
    recursive: "true",
  });

  return treeData.tree.map((item) => ({
    path: item.path || "",
    mode: item.mode || "",
    type: item.type as "tree" | "blob",
    sha: item.sha || "",
    size: item.size,
    url: item.url || "",
  }));
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  branch: string = "main"
): Promise<{ content: string; sha: string }> {
  const octokit = getOctokit();

  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
    ref: branch,
  });

  if (Array.isArray(data) || !("content" in data)) {
    throw new Error(`Path ${path} is not a valid file.`);
  }

  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

export async function commitAndPushFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  commitMessage: string,
  branch: string = "main"
): Promise<{ commitSha: string; commitUrl: string }> {
  const octokit = getOctokit();

  let sha: string | undefined = undefined;
  try {
    const existing = await fetchFileContent(owner, repo, path, branch);
    sha = existing.sha;
  } catch (err) {
    sha = undefined;
  }

  const contentBase64 = Buffer.from(content, "utf-8").toString("base64");

  const { data } = await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: commitMessage,
    content: contentBase64,
    sha,
    branch,
  });

  return {
    commitSha: data.commit.sha || "",
    commitUrl: data.commit.html_url || `https://github.com/${owner}/${repo}/commit/${data.commit.sha}`,
  };
}