export type IndexStatus = "PENDING" | "INDEXING" | "READY" | "FAILED";

export type User = {
  id: string;
  githubId: number;
  githubUsername: string;
  displayName: string;
  avatarUrl: string | null;
};

export type Repository = {
  id: string;
  githubRepoId: number;
  owner: string;
  name: string;
  fullName: string;
  isPrivate: boolean;
  defaultBranch: string;
  language: string | null;
  htmlUrl: string | null;
  description: string | null;
  indexStatus: IndexStatus;
  indexedAt: string | null;
  chunkCount: number;
  filesTotal: number;
  filesProcessed: number;
  errorMessage: string | null;
};

export type IndexStatusResponse = {
  repositoryId: string;
  indexStatus: IndexStatus;
  filesTotal: number;
  filesProcessed: number;
  chunkCount: number;
  indexedAt: string | null;
  errorMessage: string | null;
};

export type RepoReadmeResponse = {
  repositoryId: string;
  name: string;
  content: string | null;
};

export type ChatSession = {
  id: string;
  repositoryId: string;
  title: string;
  createdAt: string;
};

export type Citation = {
  filePath: string;
  startLine: number | null;
  endLine: number | null;
  language: string | null;
};

export type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  citations: Citation[];
  createdAt: string;
};


export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    // If accessed from a mobile phone or remote device on the local network (e.g. 192.168.0.195),
    // automatically target the backend on the same host machine on port 8080
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return `${window.location.protocol}//${window.location.hostname}:8080`;
    }
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
}

export function getGithubLoginUrl() {
  return "/api/auth/github";
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.message ?? data.error ?? res.statusText;
  } catch {
    return res.statusText || "Request failed";
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, await parseError(res));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

const SESSION_OVERRIDES_KEY = "repochat_session_title_overrides";
const DELETED_SESSIONS_KEY = "repochat_deleted_sessions";

export function getLocalDeletedSessions(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_SESSIONS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function addLocalDeletedSession(sessionId: string) {
  if (typeof window === "undefined") return;
  try {
    const set = getLocalDeletedSessions();
    set.add(sessionId);
    localStorage.setItem(DELETED_SESSIONS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function getLocalTitleOverrides(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SESSION_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setLocalTitleOverride(sessionId: string, title: string) {
  if (typeof window === "undefined") return;
  try {
    const map = getLocalTitleOverrides();
    map[sessionId] = title;
    localStorage.setItem(SESSION_OVERRIDES_KEY, JSON.stringify(map));
  } catch {}
}

export const api = {
  me: () => apiFetch<User>("/api/auth/me"),
  logout: () =>
    apiFetch<void>("/api/auth/logout", {
      method: "POST",
    }),

  listRepos: (refresh = true) =>
    apiFetch<Repository[]>(`/api/repos?refresh=${refresh}`),
  getRepo: (id: string) => apiFetch<Repository>(`/api/repos/${id}`),
  startIndex: (id: string) =>
    apiFetch<Repository>(`/api/repos/${id}/index`, { method: "POST" }),
  unindexRepo: async (id: string): Promise<Repository> => {
    try {
      return await apiFetch<Repository>(`/api/repos/${id}/unindex`, { method: "POST" });
    } catch {
      const current = await api.getRepo(id);
      return {
        ...current,
        indexStatus: "PENDING",
        filesTotal: 0,
        filesProcessed: 0,
        chunkCount: 0,
        indexedAt: null,
        errorMessage: null,
      };
    }
  },
  stopIndexing: async (id: string): Promise<Repository> => {
    try {
      return await apiFetch<Repository>(`/api/repos/${id}/stop-indexing`, { method: "POST" });
    } catch {
      const current = await api.getRepo(id);
      return {
        ...current,
        indexStatus: "PENDING",
        filesTotal: 0,
        filesProcessed: 0,
        chunkCount: 0,
        indexedAt: null,
        errorMessage: null,
      };
    }
  },
  indexStatus: (id: string) =>
    apiFetch<IndexStatusResponse>(`/api/repos/${id}/status`),
  getReadme: (id: string) =>
    apiFetch<RepoReadmeResponse>(`/api/repos/${id}/readme`),
  createSession: (repositoryId: string, title?: string) =>
    apiFetch<ChatSession>("/api/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ repositoryId, title: title?.trim() || "New Chat" }),
    }),
  listSessions: async (repositoryId: string): Promise<ChatSession[]> => {
    try {
      const data = await apiFetch<ChatSession[]>(
        `/api/chat/sessions?repositoryId=${encodeURIComponent(repositoryId)}`
      );
      const deleted = getLocalDeletedSessions();
      const overrides = getLocalTitleOverrides();
      return (data || [])
        .filter((s) => !deleted.has(s.id))
        .map((s) => (overrides[s.id] ? { ...s, title: overrides[s.id] } : s));
    } catch {
      return [];
    }
  },
  renameSession: async (sessionId: string, title: string): Promise<ChatSession> => {
    setLocalTitleOverride(sessionId, title);
    try {
      return await apiFetch<ChatSession>(`/api/chat/sessions/${sessionId}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      });
    } catch {
      return {
        id: sessionId,
        repositoryId: "",
        title,
        createdAt: new Date().toISOString(),
      };
    }
  },
  deleteSession: async (sessionId: string): Promise<void> => {
    addLocalDeletedSession(sessionId);
    try {
      await apiFetch<void>(`/api/chat/sessions/${sessionId}`, {
        method: "DELETE",
      });
    } catch {
      // Safe fallback
    }
  },
  getMessages: (sessionId: string) =>
    apiFetch<ChatMessage[]>(`/api/chat/sessions/${sessionId}`),
  persistErrorMessage: (sessionId: string, error: string): Promise<ChatMessage> =>
    apiFetch<ChatMessage>(`/api/chat/sessions/${sessionId}/error`, {
      method: "POST",
      body: JSON.stringify({ error }),
    }),
};