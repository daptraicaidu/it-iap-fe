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

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface Verify2faRequest {
  totp: string;
}

// ── Response Interfaces ──
export interface ApiResponse<T = undefined> {
  code: number;
  message?: string;
  data?: T;
  timestamp: string;
}

export interface RegisterData {
  userId: string;
}

export interface AuthData {
  roles: string[];
  enable2fa: boolean;
}

export interface TwoFaSetupData {
  secret: string;
  email: string;
}

// ── Auth Service ──
const authService = {
  register: (payload: RegisterRequest) =>
    apiClient.post<ApiResponse<RegisterData>>("/auth/register", payload),

  login: (payload: LoginRequest) =>
    apiClient.post<ApiResponse<AuthData>>("/auth/login", payload),

  verify2faLogin: (payload: Verify2faRequest) =>
    apiClient.post<ApiResponse<AuthData>>("/auth/login/verify-2fa", payload),

  verifyEmail: (payload: VerifyEmailRequest) =>
    apiClient.post<ApiResponse>("/auth/verify-email", payload),

  resendOtp: (payload: ResendOtpRequest) =>
    apiClient.post<ApiResponse>("/auth/resend-otp", payload),

  refreshToken: () =>
    apiClient.post<ApiResponse<AuthData>>("/auth/refresh"),

  logout: () => apiClient.post<ApiResponse<string>>("/auth/logout"),

  changePassword: (payload: ChangePasswordRequest) =>
    apiClient.post<ApiResponse<string>>("/users/change-password", payload),

  forgotPassword: (payload: ForgotPasswordRequest) =>
    apiClient.post<ApiResponse>("/auth/password/forgot", payload),

  resetPassword: (payload: ResetPasswordRequest) =>
    apiClient.post<ApiResponse>("/auth/password/reset", payload),

  // ── 2FA Management ──
  setup2fa: () =>
    apiClient.post<ApiResponse<TwoFaSetupData>>("/2fa/setup"),

  confirm2fa: (payload: Verify2faRequest) =>
    apiClient.post<ApiResponse>("/2fa/confirm", payload),

  get2faStatus: () =>
    apiClient.get<ApiResponse<boolean>>("/2fa/status"),

  disable2fa: (payload: Verify2faRequest) =>
    apiClient.post<ApiResponse>("/2fa/disable", payload),

  // ── 2FA Reset / Recovery ──
  requestReset2fa: () =>
    apiClient.post<ApiResponse<null>>("/2fa/request-reset"),

  cancelReset2fa: (payload: { token: string }) =>
    apiClient.post<ApiResponse<null>>("/2fa/cancel-reset", payload),

  confirmReset2fa: (payload: { token: string }) =>
    apiClient.post<ApiResponse<null>>("/2fa/confirm-reset", payload),
};

export default authService;
