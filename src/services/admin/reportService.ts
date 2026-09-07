import apiClient from "../../utils/axios";
import type { ApiResponse } from "../common/apiResponse";
import type { PaginatedResponse } from "../user/interviewService";
import type { ReportItem, ReportStatus } from "../user/reportService";

// ── Types ──

export interface AdminReportParams {
  reportType?: string;
  status?: string;
  email?: string;
  pages?: number;
}

export interface UpdateReportPayload {
  status: ReportStatus;
  adminReply: string;
}

// ── Service ──

const adminReportService = {
  // Get all reports (admin)
  getReports: (params: AdminReportParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<ReportItem>>>(
      "/reports",
      { params }
    ),

  // Update a report (admin)
  updateReport: (reportId: number, payload: UpdateReportPayload) =>
    apiClient.put<ApiResponse<ReportItem>>(
      `/reports/${reportId}`,
      payload
    ),
};

export default adminReportService;
