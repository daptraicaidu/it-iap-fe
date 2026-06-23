import apiClient from "../../utils/axios";

// ── Types ──

export type InterviewMode = "INTERACTIVE_INTERVIEW" | "STRESS_INTERVIEW";
export type QuestionCategory = "BEHAVIORAL" | "SITUATIONAL" | "TECHNICAL";
export type MessageRole = "USER" | "ASSISTANT";

export interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  code: number;
  message?: string;
  data?: Record<string, string>;
  timestamp: string;
}

export interface CreateInterviewPayload {
  mode: InterviewMode;
  title: string;
  profileId: number;
}

export interface CreateInterviewResult {
  interviewId: number;
}

export interface InterviewQuestion {
  interviewQuestionId: number;
  questionContent: string;
  category: string;
  timeEnd: string | null;
  hasNext: boolean;
  interviewMode: InterviewMode;
}

export interface InteractiveAnswerResult {
  content: string;
  isComplete: boolean;
  point: number | null;
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface QuestionHint {
  hint: string;
}

export interface QuestionFeedback {
  point: number;
  feedback: string;
}

export interface FeedbackQuestion {
  feedback: QuestionFeedback;
  orderIndex: number;
  questionContent: string;
  questionType: string;
  userAnswer: string;
}

export interface OverallResult {
  feedback: string;
  totalPoint: number;
}

export interface InterviewFeedbackData {
  feedbackForQuestions: FeedbackQuestion[];
  overallResult: OverallResult;
  processing: boolean;
}

// ── Service ──

const interviewService = {
  // Create a new interview session
  createInterview: (payload: CreateInterviewPayload) =>
    apiClient.post<ApiResponse<CreateInterviewResult>>("/interviews", payload),

  // Start an interview (returns first question)
  startInterview: (interviewId: number) =>
    apiClient.post<ApiResponse<InterviewQuestion>>(
      `/interviews/${interviewId}/start`
    ),

  // Get current question (for page reload recovery)
  getCurrentQuestion: (interviewId: number) =>
    apiClient.get<ApiResponse<InterviewQuestion>>(
      `/interviews/${interviewId}/current-question`
    ),

  // ── Interactive Mode ──

  // Answer a question in interactive mode
  answerInteractive: (interviewQuestionId: number, userAnswer: string) =>
    apiClient.post<ApiResponse<InteractiveAnswerResult>>(
      `/interviews/interactive/questions/${interviewQuestionId}/answers`,
      { userAnswer }
    ),

  // Move to next question in interactive mode
  nextInteractive: (interviewQuestionId: number) =>
    apiClient.post<ApiResponse<InterviewQuestion>>(
      `/interviews/interactive/questions/${interviewQuestionId}/next`
    ),

  // Get chat history for an interactive question
  getInteractiveMessages: (interviewQuestionId: number) =>
    apiClient.get<ApiResponse<ChatMessage[]>>(
      `/interviews/interactive/questions/${interviewQuestionId}/messages`
    ),

  // ── Stress Mode ──

  // Answer a question in stress mode (returns next question)
  answerStress: (interviewQuestionId: number, userAnswer: string) =>
    apiClient.post<ApiResponse<InterviewQuestion>>(
      `/interviews/stress/questions/${interviewQuestionId}/answers`,
      { userAnswer }
    ),

  // ── Common ──

  // Get hint for a question
  getQuestionHint: (interviewQuestionId: number) =>
    apiClient.get<ApiResponse<QuestionHint>>(
      `/interviews/interviewQuestion/${interviewQuestionId}/hint`
    ),

  // Get interview feedback/results
  getInterviewFeedback: (interviewId: number) =>
    apiClient.get<ApiResponse<InterviewFeedbackData>>(
      `/interviews/${interviewId}/feedback`
    ),
};

export default interviewService;
