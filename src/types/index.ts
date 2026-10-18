export interface GitHubFileNode {
  path: string;
  mode: string;
  type: "tree" | "blob";
  sha: string;
  size?: number;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  targetFile?: string;
  diff?: {
    original: string;
    modified: string;
  };
  commitSha?: string;
  commitUrl?: string;
  status?: "pending" | "success" | "error";
}

export interface AIAssistRequest {
  message: string;
  selectedFile: string;
}

export interface AIAssistResponse {
  explanation: string;
  targetFile: string;
  modifiedContent: string;
  originalContent: string;
  commitSha: string;
  commitUrl: string;
  status: "success" | "error";
  errorMessage?: string;
}