import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import {
  History,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Copy,
  Check,
  Loader2,
  CreditCard,
  Calendar,
  ExternalLink,
} from "lucide-react";
import tierService, { type OrderHistoryItem } from "../../../services/user/tierService";
import UpgradeTierModal from "../../../components/user/UpgradeTierModal";
import useUserStore from "../../../store/userStore";

const formatVND = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "--";
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

// ── Status Badge ──
const OrderStatusBadge = ({ status, t }: { status: string; t: (k: string) => string }) => {
  const code = (status || "").toUpperCase();

  if (code === "PAID" || code === "SUCCESS" || code === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
        <span>{t("orders.status.PAID")}</span>
      </span>
    );
  }

  if (code === "PENDING" || code === "PROCESSING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
        <Loader2 className="h-3 w-3 text-amber-600 animate-spin" />
        <span>{t("orders.status.PENDING")}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
      <XCircle className="h-3 w-3 text-rose-500" />
      <span>{t(`orders.status.${code}`) || code}</span>
    </span>
  );
};

const OrdersPage: React.FC = () => {
  const { t } = useTranslation("Orders");
  const location = useLocation();
  const navigate = useNavigate();
  const userInfo = useUserStore((s) => s.userInfo);

  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<number | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  // Check URL params from PayOS return (0đ active & external payment)
  const searchParams = new URLSearchParams(location.search);
  const statusParam = searchParams.get("status");
  const cancelParam = searchParams.get("cancel");
  const codeParam = searchParams.get("code");
  const orderCodeParam = searchParams.get("orderCode");

  const isPaymentSuccess =
    statusParam === "success" ||
    statusParam === "PAID" ||
    (codeParam === "00" && cancelParam === "false");

  const isPaymentCancelled =
    statusParam === "cancelled" ||
    statusParam === "CANCELLED" ||
    cancelParam === "true";

  const displayOrderCode =
    orderCodeParam ||
    (codeParam && codeParam !== "00" ? codeParam : null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await tierService.getMyOrders();
      if (res.data?.data) {
        setOrders(res.data.data);
      } else {
        setOrders([]);
      }
    } catch (err: unknown) {
      console.error("Failed to load order history:", err);
      setErrorMsg(t("orders.alerts.fetchError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCopy = (code: number) => {
    navigator.clipboard.writeText(code.toString());
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getUpgradeButtonText = () => {
    const tier = (userInfo?.activeTier || "BASIC").toUpperCase();
    if (tier.startsWith("PRO")) {
      return t("orders.upgradeButtons.viewPlans");
    }
    if (tier.startsWith("PLUS")) {
      return t("orders.upgradeButtons.switchTier");
    }
    return t("orders.upgradeButtons.upgradePro");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
      {/* PayOS Return Alerts */}
      {isPaymentSuccess && (
        <div className="flex items-start justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5 text-emerald-900 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">
                {t("orders.alerts.paymentSuccessTitle")}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 mt-0.5 leading-relaxed">
                {t("orders.alerts.paymentSuccessDesc")}
                {displayOrderCode && (
                  <span className="font-semibold ml-1">
                    (Mã đơn: #{displayOrderCode})
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/orders", { replace: true })}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer shrink-0 ml-3"
          >
            X
          </button>
        </div>
      )}

      {isPaymentCancelled && (
        <div className="flex items-start justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 text-amber-900 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                {t("orders.alerts.paymentCancelledTitle")}
              </h3>
              <p className="text-xs sm:text-sm text-amber-800 mt-0.5 leading-relaxed">
                {t("orders.alerts.paymentCancelledDesc")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/orders", { replace: true })}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline cursor-pointer shrink-0 ml-3"
          >
            X
          </button>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-zinc-900">
            <History className="h-6 w-6 text-zinc-700" />
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("orders.title")}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1.5">
            {t("orders.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            type="button"
            disabled={loading}
            onClick={fetchOrders}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-[0.98] shadow-xs cursor-pointer disabled:opacity-50"
            title={t("orders.refresh")}
          >
            <RefreshCw className={`h-3.5 w-3.5 text-zinc-500 ${loading ? "animate-spin" : ""}`} />
            <span>{t("orders.refresh")}</span>
          </button>

          {/* Upgrade Plan Button */}
          <button
            type="button"
            onClick={() => setIsUpgradeModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-zinc-800 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <span>{getUpgradeButtonText()}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Content: Desktop Table & Mobile Cards */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-24 text-center text-zinc-400">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-3" />
            <p className="font-medium text-sm text-zinc-600">Đang tải lịch sử giao dịch...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 px-4 text-center text-zinc-400">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
              <History className="h-7 w-7" />
            </div>
            <p className="font-bold text-zinc-800 text-base">{t("orders.empty")}</p>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-md mx-auto leading-relaxed">
              {t("orders.emptyDesc")}
            </p>
            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span>{getUpgradeButtonText()}</span>
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View (md and above) */}
            <div className="hidden md:block">
              <table className="w-full text-left text-xs text-zinc-600 divide-y divide-zinc-200">
                <thead className="bg-zinc-50 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th scope="col" className="px-3 py-3.5">
                      {t("orders.table.orderCode")}
                    </th>
                    <th scope="col" className="px-3 py-3.5">
                      {t("orders.table.productName")}
                    </th>
                    <th scope="col" className="px-2 py-3.5 text-center">
                      {t("orders.table.quantity")}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-right">
                      {t("orders.table.originalPrice")}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-right">
                      {t("orders.table.discountAmount")}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-right">
                      {t("orders.table.upgradeDiscount")}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-right font-bold text-zinc-900">
                      {t("orders.table.amount")}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center">
                      {t("orders.table.status")}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-right">
                      {t("orders.table.createdAt")}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center">
                      {t("orders.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {orders.map((item, index) => {
                    const isPending = (item.status || "").toUpperCase() === "PENDING";
                    const hasCheckoutUrl = !!item.checkoutUrl;

                    return (
                      <tr
                        key={item.orderCode || index}
                        className="hover:bg-zinc-50/60 transition-colors"
                      >
                        {/* Order Code */}
                        <td className="px-3 py-3.5 font-mono text-zinc-900 font-bold whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200/80 text-xs">
                              #{item.orderCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(item.orderCode)}
                              className="text-zinc-400 hover:text-zinc-700 transition-colors p-1 cursor-pointer rounded-sm"
                              title="Sao chép mã đơn"
                            >
                              {copiedCode === item.orderCode ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Product Name */}
                        <td className="px-3 py-3.5 font-semibold text-zinc-900">
                          <div className="flex items-center gap-1.5">
                            <CreditCard className="h-4 w-4 text-zinc-400 shrink-0" />
                            <span>{item.productName}</span>
                          </div>
                        </td>

                        {/* Quantity */}
                        <td className="px-2 py-3.5 text-center font-medium text-zinc-700">
                          {item.quantity}
                        </td>

                        {/* Original Price */}
                        <td className="px-3 py-3.5 text-right font-medium text-zinc-500 whitespace-nowrap">
                          {formatVND(item.originalPrice)}
                        </td>

                        {/* Discount Amount */}
                        <td className="px-3 py-3.5 text-right text-rose-600 font-medium whitespace-nowrap">
                          {item.discountAmount > 0 ? `-${formatVND(item.discountAmount)}` : "--"}
                        </td>

                        {/* Upgrade Discount */}
                        <td className="px-3 py-3.5 text-right text-blue-600 font-medium whitespace-nowrap">
                          {item.upgradeDiscount > 0 ? `-${formatVND(item.upgradeDiscount)}` : "--"}
                        </td>

                        {/* Final Amount */}
                        <td className="px-3 py-3.5 text-right font-extrabold text-sm whitespace-nowrap">
                          <span className={item.amount === 0 ? "text-emerald-700" : "text-zinc-900"}>
                            {formatVND(item.amount)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3.5 text-center whitespace-nowrap">
                          <OrderStatusBadge status={item.status} t={t} />
                        </td>

                        {/* Created At */}
                        <td className="px-3 py-3.5 text-right text-zinc-500 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-3.5 text-center whitespace-nowrap">
                          {isPending && hasCheckoutUrl ? (
                            <a
                              href={item.checkoutUrl!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs transition hover:bg-amber-700 active:scale-95 cursor-pointer"
                            >
                              <span>{t("orders.payNow")}</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-zinc-400">--</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (under md) */}
            <div className="block md:hidden divide-y divide-zinc-100">
              {orders.map((item, index) => {
                const isPending = (item.status || "").toUpperCase() === "PENDING";
                const hasCheckoutUrl = !!item.checkoutUrl;

                return (
                  <div key={item.orderCode || index} className="p-4 space-y-3">
                    {/* Top Row: Code & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
                          #{item.orderCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.orderCode)}
                          className="text-zinc-400 hover:text-zinc-700 p-1"
                        >
                          {copiedCode === item.orderCode ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                      <OrderStatusBadge status={item.status} t={t} />
                    </div>

                    {/* Product & Date */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-sm text-zinc-900 flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-zinc-400 shrink-0" />
                        <span>{item.productName}</span>
                      </div>
                      <span className="text-[11px] text-zinc-400 whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    {/* Price Breakdown */}
                    <div className="rounded-xl bg-zinc-50 p-3 space-y-1.5 text-xs text-zinc-600">
                      <div className="flex justify-between">
                        <span>{t("orders.table.quantity")}:</span>
                        <span className="font-medium text-zinc-800">{item.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("orders.table.originalPrice")}:</span>
                        <span>{formatVND(item.originalPrice)}</span>
                      </div>
                      {item.discountAmount > 0 && (
                        <div className="flex justify-between text-rose-600">
                          <span>{t("orders.table.discountAmount")}:</span>
                          <span>-{formatVND(item.discountAmount)}</span>
                        </div>
                      )}
                      {item.upgradeDiscount > 0 && (
                        <div className="flex justify-between text-blue-600">
                          <span>{t("orders.table.upgradeDiscount")}:</span>
                          <span>-{formatVND(item.upgradeDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1.5 border-t border-zinc-200/60 font-bold text-zinc-900 text-sm">
                        <span>{t("orders.table.amount")}:</span>
                        <span className={item.amount === 0 ? "text-emerald-700" : "text-zinc-900"}>
                          {formatVND(item.amount)}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Pay CTA if Pending */}
                    {isPending && hasCheckoutUrl && (
                      <a
                        href={item.checkoutUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-600 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-amber-700 active:scale-98"
                      >
                        <span>{t("orders.payNow")}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Upgrade Tier Modal */}
      <UpgradeTierModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentTier={userInfo?.activeTier ?? "BASIC"}
      />
    </div>
  );
};

export default OrdersPage;
