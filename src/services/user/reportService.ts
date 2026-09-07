import apiClient from "../../utils/axios";
import type { ApiResponse } from "../common/apiResponse";
import type { PaginatedResponse } from "./interviewService";

// ── Types ──

export type ReportType =
  | "INACCURATE_CONTENT"
  | "OUTDATED"
  | "DUPLICATE"
  | "POOR_FORMATTING"
  | "SPAM_OR_IRRELEVANT"
  | "INAPPROPRIATE"
  | "OTHER";

export type ReportStatus = "PENDING" | "REJECTED" | "APPROVED";

export interface ReportItem {
  reportId: number;
  interviewQuestionId: number;
  interviewId: number;
  createdAt: string;
  userEmail: string;
  description: string;
  status: ReportStatus;
  reportType: ReportType;
  adminReply: string | null;
}

export interface CreateReportPayload {
  interviewQuestionId: number;
  description: string;
  reportType: ReportType;
}

export interface UserReportParams {
  reportType?: string;
  status?: string;
  pages?: number;
}

// ── Service ──

const userReportService = {
  // Create a new report
  createReport: (payload: CreateReportPayload) =>
    apiClient.post<ApiResponse<null>>("/reports", payload),

  // Get current user's reports
  getMyReports: (params: UserReportParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<ReportItem>>>(
      "/reports/me",
      { params }
    ),
};

export default userReportService;
