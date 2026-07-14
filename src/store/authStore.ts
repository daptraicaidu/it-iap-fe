import { create } from "zustand";
import authService, {
  type RegisterRequest,
  type LoginRequest,
} from "../services/user/authService";

interface LoginResult {
  roles: string[];
  enable2fa: boolean;
}

interface AuthState {
  // State
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // 2FA login state
  requires2fa: boolean;
  pendingRoles: string[];

  // Actions
  login: (payload: LoginRequest) => Promise<LoginResult>;
  verify2faLogin: (totp: string) => Promise<string[]>;
  register: (payload: RegisterRequest) => Promise<string>;
  verifyEmail: (userId: string, otp: string) => Promise<void>;
  resendOtp: (userId: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void; // Clears client-side auth state only (no API call) — used for 401 session expiry
  clearError: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  roles: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,
  requires2fa: false,
  pendingRoles: [],

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.login(payload);
      const roles = res.data.data?.roles ?? [];
      const enable2fa = res.data.data?.enable2fa ?? false;

      if (enable2fa) {
        // Don't authenticate yet — wait for TOTP verification
        set({
          requires2fa: true,
          pendingRoles: roles,
          isLoading: false,
        });
      } else {
        set({ roles, isAuthenticated: true, isLoading: false });
      }

      return { roles, enable2fa };
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Login failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  verify2faLogin: async (totp) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.verify2faLogin({ totp });
      const roles = res.data.data?.roles ?? [];
      set({
        roles,
        isAuthenticated: true,
        requires2fa: false,
        pendingRoles: [],
        isLoading: false,
      });
      return roles;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "2FA verification failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.register(payload);
      const userId = res.data.data?.userId ?? "";
      set({ isLoading: false });
      return userId;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Registration failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  verifyEmail: async (userId, otp) => {
    set({ isLoading: true, error: null });
    try {
      await authService.verifyEmail({ userId, otp });
      set({ isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Verification failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  resendOtp: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      await authService.resendOtp({ userId });
      set({ isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Resend failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  refreshToken: async () => {
    try {
      const res = await authService.refreshToken();
      const roles = res.data.data?.roles ?? [];
      set({ roles, isAuthenticated: true });
    } catch {
      set({ roles: [], isAuthenticated: false });
    }
  },

  logout: async () => {
    set({ roles: [], isAuthenticated: false, isLoading: true, error: null });
    try {
      await authService.logout();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Logout failed";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  clearAuth: () => set({ roles: [], isAuthenticated: false, error: null }),

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
