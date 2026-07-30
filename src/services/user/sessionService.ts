import apiClient from "../../utils/axios";

// ── Interfaces ──

export interface UserSession {
  id: string;
  deviceType: string;
  osName: string;
  browserName: string;
  ipAddress: string;
  location: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message?: string;
  data?: T;
  timestamp?: string;
}

// ── Session Service ──

const sessionService = {
  getSessions: () => apiClient.get<ApiResponse<UserSession[]>>("/sessions"),

  revokeSession: (sessionId: string) =>
    apiClient.delete<ApiResponse<string>>(`/sessions/${sessionId}`),

  revokeOtherSessions: () =>
    apiClient.delete<ApiResponse<string>>("/sessions/other"),
};

export default sessionService;
