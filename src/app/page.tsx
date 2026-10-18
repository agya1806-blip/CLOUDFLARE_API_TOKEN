"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ChatEditor from "@/components/ChatEditor";
import FileExplorer from "@/components/FileExplorer";
import StatusBar from "@/components/StatusBar";
import { GitHubFileNode } from "@/types";
import { Loader2 } from "lucide-react";

interface RepoItem {
  name: string;
  fullName: string;
  defaultBranch: string;
}

export default function WorkspacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [allRepos, setAllRepos] = useState<RepoItem[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("CLOUDFLARE_API_TOKEN");
  const [files, setFiles] = useState<GitHubFileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [isLoadingRepo, setIsLoadingRepo] = useState(true);
  const [repoBranch, setRepoBranch] = useState("main");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAllUserRepos();
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && selectedRepo) {
      fetchRepoTree(selectedRepo);
    }
  }, [selectedRepo, status]);

  const fetchAllUserRepos = async () => {
    try {
      const res = await fetch("/api/github/repos");
      const data = await res.json();
      if (res.ok && data.repos) {
        setAllRepos(data.repos);
      }
    } catch (err) {
      console.error("Gagal memuat daftar repositori:", err);
    }
  };

  const fetchRepoTree = async (repoName: string) => {
    setIsLoadingRepo(true);
    try {
      const res = await fetch(`/api/github/tree?repo=${encodeURIComponent(repoName)}`);
      const data = await res.json();
      if (res.ok && data.tree) {
        setFiles(data.tree);
        setRepoBranch(data.branch || "main");
        if (data.tree.length > 0) {
          const srcFile = data.tree.find((f: GitHubFileNode) =>
            f.path.startsWith("src/") || f.path.endsWith(".tsx") || f.path.endsWith(".js")
          );
          setSelectedFile(srcFile ? srcFile.path : data.tree[0].path);
        } else {
          setSelectedFile("");
        }
      }
    } catch (error) {
      console.error("Gagal memuat repositori GitHub:", error);
    } finally {
      setIsLoadingRepo(false);
    }
  };

  if (status === "loading" || (isLoadingRepo && files.length === 0)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-studio-bg text-studio-textPrimary">
        <Loader2 className="h-8 w-8 animate-spin text-studio-accent mb-3" />
        <p className="text-sm text-studio-textSecondary font-medium">
          Membuka Workspace Mughis Mobile Studio...
        </p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-studio-bg">
      <Navbar
        repoName={selectedRepo}
        branchName={repoBranch}
        allRepos={allRepos}
        onSelectRepo={(repo) => setSelectedRepo(repo)}
        selectedModel={selectedModel}
        onSelectModel={(model) => setSelectedModel(model)}
      />

      <main className="flex flex-1 overflow-hidden relative">
        <ChatEditor
          files={files}
          selectedFile={selectedFile}
          selectedModel={selectedModel}
          targetRepo={selectedRepo}
          onOpenExplorer={() => setIsExplorerOpen(true)}
        />

        <FileExplorer
          files={files}
          selectedFile={selectedFile}
          onSelectFile={(path) => setSelectedFile(path)}
          isOpen={isExplorerOpen}
          onClose={() => setIsExplorerOpen(false)}
        />
      </main>

      <StatusBar branchName={repoBranch} selectedFile={selectedFile} />
    </div>
  );
}