"use client";

import React from "react";
import { Cpu, GitBranch, RefreshCw } from "lucide-react";

interface StatusBarProps {
  branchName: string;
  selectedFile: string;
}

export default function StatusBar({ branchName, selectedFile }: StatusBarProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 flex h-6 items-center justify-between bg-studio-header px-3 font-mono text-[11px] text-studio-textSecondary border-t border-studio-border select-none">
      <div className="flex items-center space-x-3">
        <span className="flex items-center text-studio-success">
          <GitBranch className="h-3 w-3 mr-1" />
          {branchName}
        </span>
        <span className="hidden sm:inline truncate max-w-[150px]">
          {selectedFile || "No File"}
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <span className="flex items-center text-studio-accent">
          <Cpu className="h-3 w-3 mr-1" /> gemini-2.5-flash
        </span>
        <span className="flex items-center text-studio-textSecondary">
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Vercel Sync
        </span>
      </div>
    </footer>
  );
}