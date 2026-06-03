import { create } from "zustand";
import authService, {
  type RegisterRequest,
  type LoginRequest,
} from "../services/user/authService";

interface AuthState {
  // State
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (payload: LoginRequest) => Promise<string[]>;
  register: (payload: RegisterRequest) => Promise<string>;
  verifyEmail: (userId: string, otp: string) => Promise<void>;
  resendOtp: (userId: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  roles: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.login(payload);
      const roles = res.data.data?.roles ?? [];
      set({ roles, isAuthenticated: true, isLoading: false });
      return roles;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Login failed";
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

  logout: () => {
    set({ roles: [], isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
