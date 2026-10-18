"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
import { Cpu, GitBranch, LogOut, Terminal } from "lucide-react";

interface NavbarProps {
  repoName: string;
  branchName: string;
}

export default function Navbar({ repoName, branchName }: NavbarProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-studio-header px-4 py-2.5 border-b border-studio-border text-studio-textPrimary select-none">
      <div className="flex items-center space-x-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-studio-accent text-white shadow-md">
          <Terminal className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white leading-none">
            Mughis Mobile Studio
          </h1>
          <div className="flex items-center space-x-1.5 mt-0.5 text-xs text-studio-textSecondary">
            <span className="truncate max-w-[120px] font-mono">{repoName}</span>
            <span>â€¢</span>
            <span className="flex items-center text-studio-success font-mono">
              <GitBranch className="h-3 w-3 mr-0.5" />
              {branchName}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="hidden sm:flex items-center space-x-1 rounded-full bg-studio-sidebar px-2.5 py-1 text-xs text-studio-textSecondary border border-studio-border">
          <Cpu className="h-3 w-3 text-studio-accent" />
          <span>Gemini 2.5</span>
        </div>

        {session?.user && (
          <div className="flex items-center space-x-2">
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