import apiClient from "../../utils/axios";
import type { ApiResponse } from "../common/apiResponse";

export type { ApiResponse };

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
  level?: string | null;
  position?: string | null;
  userRank: UserRank | null;
  profileGpa: number | null;
  profileSkillsOverview: SkillOverviewDTO | null;
  totalCompletedInterviews: number;
  totalCompletedInterviewsProfile?: number;
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
  reactType: ReactionType | "";
}

// ── Streak Leaderboard ──
export interface StreakLeaderBoardEntry {
  fullName: string;
  avatarUrl: string | null;
  currentStreak: number;
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

  deletePost: (postId: number) =>
    apiClient.delete<ApiResponse>(
      `/forum-posts/${postId}`
    ),

  getStreakLeaderBoard: () =>
    apiClient.get<ApiResponse<StreakLeaderBoardEntry[]>>(
      "/forum-posts/streak-leader-board"
    ),
};

export default forumService;
