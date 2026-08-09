import apiClient from "../../utils/axios";
import type { ApiResponse } from "../common/apiResponse";

export type UserActionType =
  | "LOGIN"
  | "CHANGE_PASSWORD"
  | "RESET_PASSWORD"
  | "UPDATE_PROFILE"
  | "DELETE_PROFILE"
  | "ENABLE_2FA"
  | "DISABLE_2FA"
  | "";

export interface UserActivityItem {
  id: number;
  actionType: string;
  description: string;
  createdAt: string;
}

export interface UserActivitiesResponse {
  content: UserActivityItem[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    unpaged: boolean;
  };
  size: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  totalElements: number;
  totalPages: number;
}

export interface GetUserActivitiesParams {
  actionType?: string;
  page?: number;
}

const userActivityService = {
  // GET /api/v1/user-activities?actionType=...&page=...
  getUserActivities: (params: GetUserActivitiesParams = {}) =>
    apiClient.get<ApiResponse<UserActivitiesResponse>>("/user-activities", {
      params: {
        actionType: params.actionType ?? "",
        page: params.page ?? 1,
      },
    }),
};

export default userActivityService;
