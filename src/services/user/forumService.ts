import apiClient from "../../utils/axios";

// ── Enums ──
export type ForumPostType = "STREAK" | "GRADE";
export type ReactionType = "LOVE" | "HAHA" | "WOW";
export type UserRank = "DIAMOND" | "GOLD" | "SILVER" | "BRONZE";

// ── Shared Data ──
export interface StreakSharedData {
  currentStreak: number;
}

export interface SkillOverviewDTO {
  coreKnowledge: number | null;
  problemSolving: number | null;
  appliedExperience: number | null;
  logicalArticulation: number | null;
  focusAndCompleteness: number | null;
}

export interface GradeSharedData {
  profileGpa: number | null;
  profileSkillsOverview: SkillOverviewDTO | null;
  userRank: UserRank | null;
  totalCompletedInterviews: number;
}

// ── Forum Post ──
export interface ForumPost {
  postId: number;
  userAvatarUrl: string | null;
  userFullName?: string | null;
  postType: ForumPostType;
  sharedData: StreakSharedData | GradeSharedData;
  createdAt: string;
  visible: boolean;
  totalLove: number;
  totalHaha: number;
  totalWow: number;
  myReaction: ReactionType | null;
}

export interface ForumPostSliceResponse {
  posts: ForumPost[];
  hasNext: boolean;
}

export interface ReactPostRequest {
  reactType: ReactionType;
}

// ── Streak Leaderboard ──
export interface StreakLeaderBoardEntry {
  fullName: string;
  avatarUrl: string | null;
  currentStreak: number;
}

export interface ApiResponse<T = undefined> {
  code: number;
  message?: string;
  data?: T;
  timestamp: string;
}

// ── Forum Service ──
const forumService = {
  getPosts: (page: number, seed: number) =>
    apiClient.get<ApiResponse<ForumPostSliceResponse>>(
      "/forum-posts",
      { params: { page, seed } }
    ),

  getMyPosts: (page: number, visible?: boolean) =>
    apiClient.get<ApiResponse<ForumPostSliceResponse>>(
      "/forum-posts/me",
      { params: { page, visible } }
    ),

  shareStreak: () =>
    apiClient.post<ApiResponse>("/forum-posts/share/streak"),

  shareGrade: (profileId: number) =>
    apiClient.post<ApiResponse>(`/forum-posts/share/grade/${profileId}`),

  reactPost: (postId: number, body: ReactPostRequest) =>
    apiClient.post<ApiResponse>(
      `/forum-posts/react/${postId}`,
      body
    ),

  changeVisibility: (postId: number) =>
    apiClient.put<ApiResponse>(
      `/forum-posts/change-visible/${postId}`
    ),

  getStreakLeaderBoard: () =>
    apiClient.get<ApiResponse<StreakLeaderBoardEntry[]>>(
      "/forum-posts/streak-leader-board"
    ),
};

export default forumService;
