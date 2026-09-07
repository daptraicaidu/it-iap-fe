import apiClient from "../../utils/axios";
import type { ApiResponse } from "../common/apiResponse";

export type { ApiResponse };

export interface ActivePromotion {
  id: number;
  code: string;
  name: string;
  description: string;
  applicableTier: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | string;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface TierItem {
  tierCode: string;
  productName: string;
  description: string;
  originalPrice: number;
  level: number;
  activePromotion: ActivePromotion | null;
}

export interface OrderHistoryItem {
  orderCode: number;
  productName: string;
  quantity: number;
  originalPrice: number;
  discountAmount: number; // giá giảm từ promotion
  upgradeDiscount: number; // giá giảm do nâng cấp từ gói có level thấp hơn
  amount: number; // giá sau khi áp dụng hết chi phí giảm
  status: "PAID" | "PENDING" | "CANCELLED" | "EXPIRED" | string;
  checkoutUrl?: string | null;
  createdAt: string;
}

export interface OrderPreviewPayload {
  accountTier: string; // 4 gói: PLUS_MONTH, PLUS_YEAR, PRO_MONTH, PRO_YEAR
  quantity: number;
}

export interface OrderPreviewData {
  originalPrice: number;
  remainingValue: number;
  promotionDiscount: number;
  finalAmount: number;
}

export interface CreateOrderPayload {
  accountTier: string;
  quantity: number;
  returnUrl: string;
  cancelUrl: string;
}

export interface CreateOrderData {
  orderCode: number;
  checkoutUrl: string;
  qrCode: string | null;
  accountTier: string;
  amount: number;
}

const tierService = {
  getTiers: () => apiClient.get<ApiResponse<TierItem[]>>("/promotions/tiers"),

  // GET /api/v1/orders/my-orders
  getMyOrders: () => apiClient.get<ApiResponse<OrderHistoryItem[]>>("/orders/my-orders"),

  // POST /api/v1/orders/preview
  previewOrder: (payload: OrderPreviewPayload) =>
    apiClient.post<ApiResponse<OrderPreviewData>>("/orders/preview", payload),

  // POST /api/v1/orders
  createOrder: (payload: CreateOrderPayload) =>
    apiClient.post<ApiResponse<CreateOrderData>>("/orders", payload),
};

export default tierService;
