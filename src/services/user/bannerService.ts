import apiClient from "../../utils/axios";

export interface ActiveBanner {
  id?: number;
  title: string;
  content: string;
  imageUrl?: string;
  marquee?: string;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  timestamp: string;
}

const bannerService = {
  getActiveBanner: () =>
    apiClient.get<ApiResponse<ActiveBanner>>("/banners/active"),
};

export default bannerService;
