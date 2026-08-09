import apiClient from "../../utils/axios";
import type { ApiResponse } from "../common/apiResponse";

export type { ApiResponse };

// ── Progress ──
export interface DailyStats {
  date: string;
  totalQuestions: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

export interface ProgressData {
  streak: StreakData;
  currentRank: string;
  dailyStats: DailyStats[];
}

// ── Profile Dashboard ──
export interface SkillOverview {
  coreKnowledge: number;
  problemSolving: number;
  appliedExperience: number;
  logicalArticulation: number;
  focusAndCompleteness: number;
}

export interface ProfileDashboardData {
  totalInterviewsThisWeek: number;
  totalInterviewsLastWeek: number;
  averageTotalPoint: number;
  improvementRate: number | null;
  skillOverview: SkillOverview;
}

const dashboardService = {
  getProgress: () =>
    apiClient.get<ApiResponse<ProgressData>>("/dashboards/progress"),

  getProfileStats: (profileId: number) =>
    apiClient.get<ApiResponse<ProfileDashboardData>>(
      `/dashboards/profiles/${profileId}`
    ),
};

export default dashboardService;
