import apiClient from "../../utils/axios";
import type { ApiResponse } from "../common/apiResponse";
import type { FeedbackItem, FeedbackListResponse, GetFeedbacksParams } from "../user/feedbackService";

// ── Service ──

const adminFeedbackService = {
  // Get all feedbacks with optional filters
  getFeedbacks: (params: GetFeedbacksParams) =>
    apiClient.get<ApiResponse<FeedbackListResponse>>("/feedbacks", {
      params,
    }),

  // Reply to a feedback (send {} to remove reply)
  replyFeedback: (id: number, payload: { adminReply?: string }) =>
    apiClient.patch<ApiResponse<FeedbackItem>>(
      `/feedbacks/${id}/reply`,
      payload
    ),

  // Delete any feedback
  deleteFeedback: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/feedbacks/${id}`),
};

export default adminFeedbackService;
