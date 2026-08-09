import apiClient from "../../utils/axios";
import type { ApiResponse } from "../common/apiResponse";

export type { ApiResponse };

export interface ActiveBanner {
  id?: number;
  title: string;
  content: string;
  imageUrl?: string;
  marquee?: string;
}

const bannerService = {
  getActiveBanner: () =>
    apiClient.get<ApiResponse<ActiveBanner>>("/banners/active"),
};

export default bannerService;
