import { create } from "zustand";

export interface UserInfo {
  fullName: string;
  avatarUrl: string | null;
  email?: string;
  activeTier?: string;
  subscriptionEndDate?: string | null;
}

interface UserState {
  userInfo: UserInfo | null;
  setUserInfo: (info: UserInfo | null) => void;
  clearUserInfo: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userInfo: null,
  setUserInfo: (info) => set({ userInfo: info }),
  clearUserInfo: () => set({ userInfo: null }),
}));

export default useUserStore;
