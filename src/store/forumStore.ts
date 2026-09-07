import { create } from "zustand";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../services/common/apiResponse";
import forumService, {
  type ForumPost,
  type ReactionType,
  type StreakLeaderBoardEntry,
} from "../services/user/forumService";

type FilterType = "all" | "mine";

interface ForumState {
  // State
  posts: ForumPost[];
  hasNext: boolean;
  currentPage: number;
  seed: number;
  filter: FilterType;
  visibleFilter?: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  isSharing: boolean;

  // Leaderboard
  leaderboard: StreakLeaderBoardEntry[];
  isLoadingLeaderboard: boolean;

  // Actions
  fetchPosts: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  loadMore: () => Promise<void>;
  setFilter: (filter: FilterType) => void;
  setVisibleFilter: (visible?: boolean) => void;
  shareStreak: () => Promise<void>;
  shareGrade: (profileId: number) => Promise<void>;
  reactPost: (postId: number, reactType: ReactionType | "") => Promise<void>;
  toggleVisibility: (postId: number) => Promise<void>;
  deletePost: (postId: number) => Promise<{ success: boolean; message?: string }>;
  fetchLeaderboard: () => Promise<void>;
  reset: () => void;
}

const generateSeed = () =>
  Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;

const useForumStore = create<ForumState>((set, get) => ({
  posts: [],
  hasNext: false,
  currentPage: 1,
  seed: generateSeed(),
  filter: "all",
  visibleFilter: undefined,
  isLoading: false,
  isLoadingMore: false,
  isSharing: false,
  leaderboard: [],
  isLoadingLeaderboard: false,

  fetchPosts: async () => {
    const { filter, seed, visibleFilter } = get();
    set({ isLoading: true, currentPage: 1 });
    try {
      const res =
        filter === "all"
          ? await forumService.getPosts(1, seed)
          : await forumService.getMyPosts(1, visibleFilter);
      const data = res.data.data;
      set({
        posts: data?.posts ?? [],
        hasNext: data?.hasNext ?? false,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  refreshPosts: async () => {
    const { filter, visibleFilter } = get();
    const newSeed = generateSeed();
    set({ seed: newSeed, currentPage: 1, posts: [], isLoading: true });
    try {
      const res =
        filter === "all"
          ? await forumService.getPosts(1, newSeed)
          : await forumService.getMyPosts(1, visibleFilter);
      const data = res.data.data;
      set({
        posts: data?.posts ?? [],
        hasNext: data?.hasNext ?? false,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  loadMore: async () => {
    const { filter, seed, visibleFilter, currentPage, hasNext, isLoadingMore } = get();
    if (!hasNext || isLoadingMore) return;

    const nextPage = currentPage + 1;
    set({ isLoadingMore: true });
    try {
      const res =
        filter === "all"
          ? await forumService.getPosts(nextPage, seed)
          : await forumService.getMyPosts(nextPage, visibleFilter);
      const data = res.data.data;
      set((state) => ({
        posts: [...state.posts, ...(data?.posts ?? [])],
        hasNext: data?.hasNext ?? false,
        currentPage: nextPage,
        isLoadingMore: false,
      }));
    } catch {
      set({ isLoadingMore: false });
    }
  },

  setFilter: (filter) => {
    const current = get().filter;
    if (current === filter) return;
    set({ filter, posts: [], seed: filter === "all" ? generateSeed() : get().seed });
    get().fetchPosts();
  },

  setVisibleFilter: (visibleFilter) => {
    set({ visibleFilter, posts: [] });
    get().fetchPosts();
  },

  shareStreak: async () => {
    set({ isSharing: true });
    try {
      await forumService.shareStreak();
      // Switch to "mine" tab and reload
      set({ filter: "mine" });
      await get().fetchPosts();
    } finally {
      set({ isSharing: false });
    }
  },

  shareGrade: async (profileId: number) => {
    set({ isSharing: true });
    try {
      await forumService.shareGrade(profileId);
      // Switch to "mine" tab and reload
      set({ filter: "mine" });
      await get().fetchPosts();
    } finally {
      set({ isSharing: false });
    }
  },

  reactPost: async (postId, reactType) => {
    const { posts } = get();
    const postIndex = posts.findIndex((p) => p.postId === postId);
    if (postIndex === -1) return;

    const post = posts[postIndex];
    const prevReaction = post.myReaction;
    const isRemoving = prevReaction === reactType || reactType === "";

    // Optimistic update
    const updatedPosts = [...posts];
    const updatedPost = { ...post };

    // Remove previous reaction count
    if (prevReaction) {
      const prevKey = `total${prevReaction.charAt(0)}${prevReaction.slice(1).toLowerCase()}` as
        | "totalLove"
        | "totalHaha"
        | "totalWow";
      updatedPost[prevKey] = Math.max(0, updatedPost[prevKey] - 1);
    }

    if (isRemoving) {
      // Toggle off / Cancel
      updatedPost.myReaction = null;
    } else {
      // Add new reaction count
      const newKey = `total${reactType.charAt(0)}${reactType.slice(1).toLowerCase()}` as
        | "totalLove"
        | "totalHaha"
        | "totalWow";
      updatedPost[newKey] = updatedPost[newKey] + 1;
      updatedPost.myReaction = reactType as ReactionType;
    }

    updatedPosts[postIndex] = updatedPost;
    set({ posts: updatedPosts });

    // Call API: send "" when removing
    try {
      await forumService.reactPost(postId, {
        reactType: isRemoving ? "" : (reactType as ReactionType),
      });
    } catch {
      // Revert on failure
      updatedPosts[postIndex] = post;
      set({ posts: [...updatedPosts] });
    }
  },

  toggleVisibility: async (postId) => {
    const { posts } = get();
    const postIndex = posts.findIndex((p) => p.postId === postId);
    if (postIndex === -1) return;

    const post = posts[postIndex];

    // Optimistic update
    const updatedPosts = [...posts];
    updatedPosts[postIndex] = { ...post, visible: !post.visible };
    set({ posts: updatedPosts });

    try {
      await forumService.changeVisibility(postId);
    } catch {
      // Revert on failure
      updatedPosts[postIndex] = post;
      set({ posts: [...updatedPosts] });
    }
  },

  deletePost: async (postId) => {
    try {
      const res = await forumService.deletePost(postId);
      if (res.status === 200 || res.data?.code === 200) {
        set((state) => ({
          posts: state.posts.filter((p) => p.postId !== postId),
        }));
        return { success: true };
      }
      return {
        success: false,
        message: res.data?.message,
      };
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<ApiResponse>;
      const message =
        axiosErr.response?.data?.message ||
        (axiosErr.response?.status === 403
          ? "Bạn không có quyền thực hiện hành động này"
          : undefined);
      return { success: false, message };
    }
  },

  fetchLeaderboard: async () => {
    set({ isLoadingLeaderboard: true });
    try {
      const res = await forumService.getStreakLeaderBoard();
      set({ leaderboard: res.data.data ?? [], isLoadingLeaderboard: false });
    } catch {
      set({ isLoadingLeaderboard: false });
    }
  },

  reset: () =>
    set({
      posts: [],
      hasNext: false,
      currentPage: 1,
      seed: generateSeed(),
      filter: "all",
      visibleFilter: undefined,
      isLoading: false,
      isLoadingMore: false,
      isSharing: false,
      leaderboard: [],
      isLoadingLeaderboard: false,
    }),
}));

export default useForumStore;
