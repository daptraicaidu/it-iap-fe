import apiClient from "../../utils/axios";

// ── Types ──

export interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
  timestamp: string;
}

export interface ChatSession {
  id: number;
  title: string;
}

export interface ChatBotResponse {
  aiResponse: string;
}

export interface SendMessagePayload {
  sessionId: number;
  userMessage: string;
}

export interface CreateSessionPayload {
  title: string;
}

export interface SessionMessage {
  role: "USER" | "ASSISTANT";
  content: string;
}

// ── Service ──

const chatBotService = {
  // Send a message to the chatbot
  sendMessage: (payload: SendMessagePayload) =>
    apiClient.post<ApiResponse<ChatBotResponse>>("/chatbot", payload),

  // Get all chat sessions
  getSessions: () =>
    apiClient.get<ApiResponse<ChatSession[]>>("/chatSessions"),

  // Create a new chat session
  createSession: (payload: CreateSessionPayload) =>
    apiClient.post<ApiResponse<ChatSession>>("/chatSessions", payload),

  // Delete a chat session
  deleteSession: (chatSessionId: number) =>
    apiClient.delete<ApiResponse<string>>(
      `/chatSessions/${chatSessionId}`
    ),

  // Get messages for a specific chat session
  getMessages: (chatSessionId: number) =>
    apiClient.get<ApiResponse<SessionMessage[]>>(
      `/chatSessions/${chatSessionId}/messages`
    ),
};

export default chatBotService;
