import apiClient from "../../utils/axios";
import type { ApiResponse } from "../common/apiResponse";

export type { ApiResponse };

// ── Interfaces ──

export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string;
  createAt: string;
  deletedAt: string | null;
  active: boolean;
  activeTier?: string;
  subscriptionEndDate?: string | null;
}

export interface UpdateUserInfoPayload {
  phoneNumber: string;
  fullName: string;
}

export interface ChangeEmailPayload {
  newEmail: string;
}

export interface VerifyChangeEmailPayload {
  otp: string;
}

// Error response for validation
export interface ValidationErrorData {
  [field: string]: string;
}

// ── User Info Service ──

const userInfoService = {
  getUserInfo: () =>
    apiClient.get<ApiResponse<UserInfo>>("/users/info"),

  updateUserInfo: (payload: UpdateUserInfoPayload) =>
    apiClient.put<ApiResponse<UserInfo>>("/users/info", payload),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<ApiResponse<string>>("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  changeEmail: (payload: ChangeEmailPayload) =>
    apiClient.post<ApiResponse>("/users/change-email", payload),

  verifyChangeEmail: (payload: VerifyChangeEmailPayload) =>
    apiClient.post<ApiResponse>("/users/verify-change-email", payload),
};

export default userInfoService;
