import apiClient from "../../utils/axios";

// ── Types ──

export interface CreateNotificationPayload {
  title: string;
  content: string;
  link: string | null;
}

export interface AdminNotificationItem {
  identifyCode: string;
  title: string;
  content: string;
  type: string;
  link: string | null;
  createdAt: string;
}

export interface SortInfo {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PageableInfo {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: SortInfo;
  unpaged: boolean;
}

export interface PaginatedAdminNotifications {
  content: AdminNotificationItem[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableInfo;
  size: number;
  sort: SortInfo;
  totalElements: number;
  totalPages: number;
}

export interface ApiResponse<T = undefined> {
  code: number;
  message?: string;
  data?: T;
  timestamp: string;
}

export interface NotificationValidationErrorData {
  title?: string;
  content?: string;
}

// ── Service ──

const adminNotificationService = {
  // POST /api/v1/notifications - Admin create notification
  createNotification: (payload: CreateNotificationPayload) => {
    return apiClient.post<ApiResponse<undefined>>("/notifications", payload);
  },

  // GET /api/v1/notifications/admin?page={page}&size={size} - Get admin notifications
  getAdminNotifications: (page: number = 1, size: number = 15) => {
    return apiClient.get<ApiResponse<PaginatedAdminNotifications>>("/notifications/admin", {
      params: {
        page,
        size,
      },
    });
  },

  // DELETE /api/v1/notifications/{identifyCode} - Delete notification by identifyCode
  deleteNotification: (identifyCode: string) => {
    return apiClient.delete<ApiResponse<undefined>>(`/notifications/${identifyCode}`);
  },
};

export default adminNotificationService;
