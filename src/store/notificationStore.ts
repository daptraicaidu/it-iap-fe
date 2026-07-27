import { create } from "zustand";
import notificationService, {
  type NotificationResponse,
} from "../services/user/notificationService";

interface NotificationState {
  notifications: NotificationResponse[];
  unreadCount: number;
  page: number;
  hasNext: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasFetched: boolean;

  fetchNotifications: (pageNum?: number, append?: boolean) => Promise<void>;
  markAsRead: (id: number) => void;
  readAll: () => Promise<void>;
  flushReadQueue: () => void;
}

let readQueue = new Set<number>();
let readTimer: ReturnType<typeof setTimeout> | null = null;

const flushQueue = () => {
  const ids = Array.from(readQueue);
  if (ids.length === 0) return;

  readQueue.clear();
  notificationService.readNotifications(ids).catch(() => {
    ids.forEach((id) => readQueue.add(id));
  });
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  page: 1,
  hasNext: false,
  isLoading: false,
  isLoadingMore: false,
  hasFetched: false,

  fetchNotifications: async (pageNum = 1, append = false) => {
    if (append) {
      set({ isLoadingMore: true });
    } else {
      set({ isLoading: true });
    }

    try {
      const res = await notificationService.getNotifications(pageNum);
      if (res.data.data) {
        const data = res.data.data;
        set((state) => ({
          notifications: pageNum === 1 || !append
            ? data.notifications
            : [...state.notifications, ...data.notifications],
          unreadCount: data.unread,
          hasNext: data.hasNext,
          page: pageNum,
          hasFetched: true,
        }));
      }
    } catch {
      // Silently fail
    } finally {
      set({ isLoading: false, isLoadingMore: false });
    }
  },

  markAsRead: (id: number) => {
    const { notifications } = get();
    const target = notifications.find((n) => n.id === id);
    if (!target || target.read) return;

    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    readQueue.add(id);
    if (readTimer) clearTimeout(readTimer);
    readTimer = setTimeout(() => {
      flushQueue();
    }, 3000);
  },

  readAll: async () => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));

    readQueue.clear();
    if (readTimer) clearTimeout(readTimer);

    try {
      await notificationService.readAllNotifications();
    } catch {
      // Silently fail
    }
  },

  flushReadQueue: () => {
    if (readTimer) clearTimeout(readTimer);
    flushQueue();
  },
}));

export default useNotificationStore;
