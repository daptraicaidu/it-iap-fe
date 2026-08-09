import apiClient from "../../utils/axios";
import type { ApiResponse } from "../common/apiResponse";

export type { ApiResponse };

export type ApplicableTierType = "PLUS_MONTH" | "PLUS_YEAR" | "PRO_MONTH" | "PRO_YEAR" | string;
export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT" | string;

export interface PromotionItem {
  id: number;
  code: string;
  name: string;
  description: string;
  applicableTier: ApplicableTierType;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface PromotionPageData {
  content: PromotionItem[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
  pageable?: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort?: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    unpaged?: boolean;
  };
}

export interface CreatePromotionPayload {
  code: string;
  name: string;
  description: string;
  applicableTier: ApplicableTierType;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
}

export const TIER_OPTIONS = [
  { value: "PLUS_MONTH", labelVi: "Gói Plus (1 Tháng)", labelEn: "Plus Plan (1 Month)" },
  { value: "PLUS_YEAR", labelVi: "Gói Plus (1 Năm)", labelEn: "Plus Plan (1 Year)" },
  { value: "PRO_MONTH", labelVi: "Gói Pro (1 Tháng)", labelEn: "Pro Plan (1 Month)" },
  { value: "PRO_YEAR", labelVi: "Gói Pro (1 Năm)", labelEn: "Pro Plan (1 Year)" },
];

export const DISCOUNT_TYPE_OPTIONS = [
  { value: "PERCENTAGE", labelVi: "Phần trăm (%)", labelEn: "Percentage (%)" },
  { value: "FIXED_AMOUNT", labelVi: "Số tiền cố định (VNĐ)", labelEn: "Fixed Amount (VND)" },
];

/**
 * Helper to calculate estimated price after discount
 */
export const calculateDiscountPrice = (
  originalPrice: number | null | undefined,
  discountType: DiscountType,
  discountValue: number
): number | null => {
  if (originalPrice === null || originalPrice === undefined || originalPrice <= 0) {
    return null;
  }
  if (discountType === "PERCENTAGE") {
    const discount = (originalPrice * discountValue) / 100;
    return Math.max(0, Math.round(originalPrice - discount));
  }
  if (discountType === "FIXED_AMOUNT") {
    return Math.max(0, originalPrice - discountValue);
  }
  return originalPrice;
};

const adminPromotionService = {
  getPromotions: (page: number = 1) =>
    apiClient.get<ApiResponse<PromotionPageData>>("/promotions", {
      params: { page },
    }),

  createPromotion: (payload: CreatePromotionPayload) =>
    apiClient.post<ApiResponse<PromotionItem>>("/promotions", payload),

  togglePromotionStatus: (promotionId: number) =>
    apiClient.patch<ApiResponse<PromotionItem>>(`/promotions/${promotionId}/toggle-status`),
};

export default adminPromotionService;
