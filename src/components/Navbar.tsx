"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
import { Cpu, GitBranch, LogOut, Terminal, FolderGit2, ChevronDown } from "lucide-react";

interface RepoItem {
  name: string;
  fullName: string;
  defaultBranch: string;
}

interface NavbarProps {
  repoName: string;
  branchName: string;
  allRepos: RepoItem[];
  onSelectRepo: (repoName: string) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export default function Navbar({
  repoName,
  branchName,
  allRepos,
  onSelectRepo,
  selectedModel,
  onSelectModel,
}: NavbarProps) {
  const { data: session } = useSession();

  const availableModels = [
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (Fast)" },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (Deep)" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Large Context)" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Standard)" },
  ];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-studio-header px-3 py-2 border-b border-studio-border text-studio-textPrimary select-none">
      <div className="flex items-center space-x-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-studio-accent text-white shadow-md">
          <Terminal className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <FolderGit2 className="h-3.5 w-3.5 text-studio-accent" />
            <select
              value={repoName}
              onChange={(e) => onSelectRepo(e.target.value)}
              className="bg-studio-sidebar border border-studio-border rounded px-1.5 py-0.5 text-xs font-mono font-bold text-white focus:outline-none cursor-pointer"
            >
              {allRepos.length > 0 ? (
                allRepos.map((r) => (
                  <option key={r.name} value={r.name} className="bg-studio-sidebar text-studio-textPrimary">
                    {r.name}
                  </option>
                ))
              ) : (
                <option value={repoName}>{repoName}</option>
              )}
            </select>
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5 text-xs text-studio-textSecondary">
            <span className="flex items-center text-studio-success font-mono text-[10px]">
              <GitBranch className="h-3 w-3 mr-0.5" />
              {branchName}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex items-center bg-studio-sidebar border border-studio-border rounded-lg px-2 py-1 text-xs text-studio-accent font-semibold">
          <Cpu className="h-3.5 w-3.5 mr-1 text-studio-accent" />
          <select
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="bg-transparent text-studio-textPrimary focus:outline-none cursor-pointer pr-3 font-mono text-[11px] appearance-none"
          >
            {availableModels.map((m) => (
              <option key={m.id} value={m.id} className="bg-studio-sidebar text-studio-textPrimary">
                {m.name}
              </option>
            ))}
          </select>
          <ChevronDown className="h-3 w-3 text-studio-textSecondary absolute right-1 pointer-events-none" />
        </div>

        {session?.user && (
          <div className="flex items-center space-x-1.5">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="h-7 w-7 rounded-full border border-studio-border"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-studio-accent flex items-center justify-center text-xs font-bold text-white">
                {session.user.name?.[0] || "U"}
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 text-studio-textSecondary hover:text-white hover:bg-studio-border rounded-md transition"
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}