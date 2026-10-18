"use client";

import React, { useState } from "react";
import { GitHubFileNode } from "@/types";
import { FileCode, FileText, Folder, Search, X, ChevronRight } from "lucide-react";

interface FileExplorerProps {
  files: GitHubFileNode[];
  selectedFile: string;
  onSelectFile: (path: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function FileExplorer({
  files,
  selectedFile,
  onSelectFile,
  isOpen,
  onClose,
}: FileExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFiles = files.filter((f) =>
    f.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (path: string) => {
    if (path.endsWith(".tsx") || path.endsWith(".ts") || path.endsWith(".jsx") || path.endsWith(".js")) {
      return <FileCode className="h-4 w-4 text-blue-400" />;
    }
    if (path.endsWith(".json") || path.endsWith(".md")) {
      return <FileText className="h-4 w-4 text-amber-400" />;
    }
    return <FileCode className="h-4 w-4 text-studio-textSecondary" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-studio-bg/95 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-studio-border bg-studio-header px-4 py-3">
        <div className="flex items-center space-x-2">
          <Folder className="h-5 w-5 text-studio-accent" />
          <h2 className="text-base font-semibold text-white">File Explorer</h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-studio-textSecondary hover:bg-studio-border hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-3 border-b border-studio-border bg-studio-sidebar">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-studio-textSecondary" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari file di repositori..."
            className="w-full rounded-lg bg-studio-bg pl-9 pr-4 py-2 text-sm text-studio-textPrimary border border-studio-border focus:border-studio-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredFiles.length === 0 ? (
          <div className="p-8 text-center text-xs text-studio-textSecondary">
            Tidak ada file yang cocok dengan pencarian.
          </div>
        ) : (
          filteredFiles.map((file) => {
            const isSelected = file.path === selectedFile;
            return (
              <button
                key={file.sha}
                onClick={() => {
                  onSelectFile(file.path);
                  onClose();
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  isSelected
                    ? "bg-studio-accent text-white font-medium"
                    : "text-studio-textPrimary hover:bg-studio-sidebar"
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate pr-2">
                  {getFileIcon(file.path)}
                  <span className="truncate font-mono text-xs">{file.path}</span>
                </div>
                <ChevronRight
                  className={`h-4 w-4 flex-shrink-0 ${
                    isSelected ? "text-white" : "text-studio-textSecondary"
                  }`}
                />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}