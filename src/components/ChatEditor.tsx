"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, GitHubFileNode } from "@/types";
import DiffViewer from "./DiffViewer";
import { FolderOpen, Send, Loader2, Bot, User } from "lucide-react";

interface ChatEditorProps {
  files: GitHubFileNode[];
  selectedFile: string;
  selectedModel: string;
  onOpenExplorer: () => void;
}

export default function ChatEditor({
  files,
  selectedFile,
  selectedModel,
  onOpenExplorer,
}: ChatEditorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Halo! Saya Gemini AI Agent di Mughis Mobile Studio. Pilih model AI & file dari repositori, lalu ketik instruksi kode yang ingin Anda ubah.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!selectedFile) {
      alert("Silakan pilih file terlebih dahulu dari File Explorer.");
      onOpenExplorer();
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      targetFile: selectedFile,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const promptText = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptText,
          selectedFile: selectedFile,
          selectedModel: selectedModel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memproses perintah AI");
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.explanation,
        targetFile: data.targetFile,
        diff: {
          original: data.originalContent,
          modified: data.modifiedContent,
        },
        commitSha: data.commitSha,
        commitUrl: data.commitUrl,
        status: "success",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `âŒ Gagal: ${error.message || "Terjadi kesalahan sistem."}`,
        status: "error",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Perbaiki bug dan optimasi performa",
    "Tambahkan mode gelap Tailwind",
    "Buat fungsi komponen UI baru",
    "Refactor kode agar lebih bersih",
  ];

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-85px)] bg-studio-bg text-studio-textPrimary">
      <div className="flex items-center justify-between border-b border-studio-border bg-studio-sidebar px-4 py-2">
        <div className="flex items-center space-x-2 truncate">
          <span className="text-xs text-studio-textSecondary">Active File:</span>
          <span className="rounded bg-studio-header px-2 py-0.5 font-mono text-xs text-studio-accent border border-studio-border font-semibold truncate max-w-[200px]">
            {selectedFile || "Belum ada file dipilih"}
          </span>
        </div>
        <button
          onClick={onOpenExplorer}
          className="flex items-center space-x-1.5 rounded-lg bg-studio-accent px-3 py-1 text-xs font-semibold text-white shadow hover:bg-studio-accentHover transition"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          <span>Pilih File</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div className="flex items-center space-x-1.5 mb-1 text-[11px] text-studio-textSecondary">
              {msg.role === "assistant" ? (
                <>
                  <Bot className="h-3.5 w-3.5 text-studio-accent" />
                  <span className="font-semibold text-studio-accent">Gemini AI Agent ({selectedModel})</span>
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5 text-studio-textSecondary" />
                  <span>Anda</span>
                </>
              )}
              <span>â€¢</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.role === "user"
                  ? "bg-studio-accent text-white rounded-tr-none"
                  : "bg-studio-sidebar text-studio-textPrimary border border-studio-border rounded-tl-none"
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

              {msg.diff && msg.targetFile && (
                <DiffViewer
                  original={msg.diff.original}
                  modified={msg.diff.modified}
                  targetFile={msg.targetFile}
                  commitSha={msg.commitSha}
                  commitUrl={msg.commitUrl}
                />
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 rounded-2xl bg-studio-sidebar border border-studio-border p-3 w-fit text-xs text-studio-textSecondary">
            <Loader2 className="h-4 w-4 animate-spin text-studio-accent" />
            <span>Gemini AI ({selectedModel}) sedang membaca kode & commit ke GitHub...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex overflow-x-auto gap-2 px-4 py-2 border-t border-studio-border/50 bg-studio-bg no-scrollbar">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => setInput(prompt)}
            className="flex-shrink-0 rounded-full bg-studio-sidebar px-3 py-1 text-xs text-studio-textSecondary border border-studio-border hover:border-studio-accent hover:text-white transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="border-t border-studio-border bg-studio-sidebar p-3">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              selectedFile
                ? `Perintahkan Gemini (${selectedModel}) untuk mengedit ${selectedFile}...`
                : "Pilih file dari Explorer untuk mulai chat..."
            }
            disabled={isLoading}
            className="flex-1 rounded-xl bg-studio-bg px-4 py-3 text-sm text-studio-textPrimary border border-studio-border focus:border-studio-accent focus:outline-none placeholder:text-studio-textSecondary"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-studio-accent text-white shadow hover:bg-studio-accentHover disabled:opacity-50 transition flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}