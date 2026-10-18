"use client";

import React from "react";
import { CheckCircle2, GitCommit, ExternalLink } from "lucide-react";

interface DiffViewerProps {
  original: string;
  modified: string;
  targetFile: string;
  commitSha?: string;
  commitUrl?: string;
}

export default function DiffViewer({
  original,
  modified,
  targetFile,
  commitSha,
  commitUrl,
}: DiffViewerProps) {
  const origLines = original.split("\n");
  const modLines = modified.split("\n");

  return (
    <div className="my-2 overflow-hidden rounded-xl border border-studio-border bg-studio-header text-xs shadow-lg">
      <div className="flex items-center justify-between border-b border-studio-border bg-studio-sidebar px-3 py-2">
        <span className="font-mono text-studio-accent font-semibold truncate max-w-[200px]">
          {targetFile}
        </span>
        {commitSha && (
          <a
            href={commitUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-studio-success hover:underline font-mono text-[11px]"
          >
            <GitCommit className="h-3.5 w-3.5" />
            <span>{commitSha.substring(0, 7)}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <div className="max-h-60 overflow-x-auto overflow-y-auto font-mono p-2 space-y-0.5 bg-[#141517]">
        {modLines.map((line, idx) => {
          const origLine = origLines[idx];
          const isAdded = origLine !== line;
          return (
            <div
              key={idx}
              className={`flex items-start px-2 py-0.5 rounded ${
                isAdded ? "bg-emerald-950/50 text-emerald-300" : "text-studio-textSecondary"
              }`}
            >
              <span className="w-8 select-none text-right pr-3 text-studio-border text-[10px]">
                {idx + 1}
              </span>
              <span className="w-4 select-none font-bold text-[10px]">
                {isAdded ? "+" : " "}
              </span>
              <span className="whitespace-pre flex-1">{line}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-studio-border bg-studio-sidebar/50 px-3 py-1.5 text-[11px] text-studio-textSecondary">
        <span className="flex items-center text-studio-success">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Auto-Committed & Pushed
        </span>
        <span>Vercel Auto-Deploy Triggered</span>
      </div>
    </div>
  );
}