import apiClient from "../../utils/axios";

// ── Types ──
export type NotificationType =
  | "SYSTEM"
  | "ADMIN"
  | "WARNING"
  | "PROMO"
  | "REPORT"
  | "FEEDBACK"
  | "STREAK"
  | string;

export interface NotificationResponse {
  id: number;
  title: string;
  content: string;
  type: NotificationType;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export interface NotificationSliceResponse {
  notifications: NotificationResponse[];
  unread: number;
  hasNext: boolean;
}

export interface ReadNotificationRequest {
  notificationId: number[];
}

export interface ReadNotificationResponse {
  notificationId: number[];
  read: number;
}

export interface ApiResponse<T = undefined> {
  code: number;
  message?: string;
  data?: T;
  timestamp: string;
}

// ── Notification Service ──
const notificationService = {
  getNotifications: (page: number = 1) =>
    apiClient.get<ApiResponse<NotificationSliceResponse>>(
      "/notifications",
      { params: { page } }
    ),

  readNotifications: (notificationId: number[]) =>
    apiClient.put<ApiResponse<ReadNotificationResponse>>(
      "/notifications",
      { notificationId } as ReadNotificationRequest
    ),

  readAllNotifications: () =>
    apiClient.put<ApiResponse>("/notifications/read-all"),
};

export default notificationService;
