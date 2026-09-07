export interface ApiResponse<T = undefined> {
  code: number;
  message?: string;
  data?: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  code: number;
  message?: string;
  data?: Record<string, string>;
  timestamp: string;
}
