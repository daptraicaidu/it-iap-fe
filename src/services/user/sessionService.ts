import apiClient from "../../utils/axios";
import type { ApiResponse } from "../common/apiResponse";

export type { ApiResponse };

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

// ── Session Service ──

const sessionService = {
  getSessions: () => apiClient.get<ApiResponse<UserSession[]>>("/sessions"),

  revokeSession: (sessionId: string) =>
    apiClient.delete<ApiResponse<string>>(`/sessions/${sessionId}`),

  revokeOtherSessions: () =>
    apiClient.delete<ApiResponse<string>>("/sessions/other"),
};

export default sessionService;
