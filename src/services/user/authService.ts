import apiClient from "../../utils/axios";

// ── Request Interfaces ──
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  userId: string;
  otp: string;
}

export interface ResendOtpRequest {
  userId: string;
}

// ── Response Interfaces ──
export interface ApiResponse<T = undefined> {
  code: number;
  data?: T;
  timestamp: string;
}

export interface RegisterData {
  userId: string;
}

export interface AuthData {
  roles: string[];
}

// ── Auth Service ──
const authService = {
  register: (payload: RegisterRequest) =>
    apiClient.post<ApiResponse<RegisterData>>("/auth/register", payload),

  login: (payload: LoginRequest) =>
    apiClient.post<ApiResponse<AuthData>>("/auth/login", payload),

  verifyEmail: (payload: VerifyEmailRequest) =>
    apiClient.post<ApiResponse>("/auth/verify-email", payload),

  resendOtp: (payload: ResendOtpRequest) =>
    apiClient.post<ApiResponse>("/auth/resend-otp", payload),

  refreshToken: () =>
    apiClient.post<ApiResponse<AuthData>>("/auth/refresh"),
};

export default authService;
