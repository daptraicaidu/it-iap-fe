import { useEffect, useState } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Loader2, ShieldCheck, ShieldAlert, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import authService from "../../../services/user/authService";
import type { ApiErrorResponse } from "../../../services/user/interviewService";
import type { AxiosError } from "axios";

type ResetAction = "confirm" | "cancel";

const Reset2faPage = () => {
  const { t } = useTranslation("Auth");
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const action: ResetAction = location.pathname.includes("/cancel") ? "cancel" : "confirm";

  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleResetAction = async () => {
      if (!token) {
        setIsLoading(false);
        setStatus("error");
        setMessage(t("reset2fa.invalidToken", "Đường dẫn không hợp lệ (Thiếu token xác thực)"));
        return;
      }

      setIsLoading(true);
      try {
        if (action === "cancel") {
          const res = await authService.cancelReset2fa({ token });
          setStatus("success");
          setMessage(
            res.data?.message ||
              t(
                "reset2fa.cancelSuccessMsg",
                "Đã hủy bỏ yêu cầu gỡ 2FA. Tài khoản của bạn vẫn được bảo vệ bằng xác thực 2 bước."
              )
          );
        } else {
          const res = await authService.confirmReset2fa({ token });
          setStatus("success");
          setMessage(
            res.data?.message ||
              t("reset2fa.confirmSuccessMsg", "Yêu cầu gỡ 2FA đã được xác nhận thành công.")
          );
        }
      } catch (err: unknown) {
        const axiosErr = err as AxiosError<ApiErrorResponse>;
        setStatus("error");
        setMessage(
          axiosErr.response?.data?.message ||
            t(
              "reset2fa.defaultErrorMsg",
              "Đường dẫn yêu cầu khôi phục 2FA không hợp lệ hoặc đã hết hạn"
            )
        );
      } finally {
        setIsLoading(false);
      }
    };

    handleResetAction();
  }, [token, action, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm text-center"
      >
        {isLoading ? (
          <div className="py-8 space-y-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-zinc-900" />
            <h2 className="text-lg font-semibold text-zinc-900">
              {t("reset2fa.loadingTitle", "Đang xử lý yêu cầu khôi phục 2FA...")}
            </h2>
            <p className="text-xs text-zinc-500">
              {t("reset2fa.loadingDesc", "Vui lòng chờ trong giây lát")}
            </p>
          </div>
        ) : status === "success" ? (
          <div className="space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              {action === "cancel" ? (
                <ShieldCheck className="h-8 w-8" />
              ) : (
                <CheckCircle2 className="h-8 w-8" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                {action === "cancel"
                  ? t("reset2fa.cancelSuccessTitle", "Đã hủy yêu cầu gỡ 2FA")
                  : t("reset2fa.confirmSuccessTitle", "Xác nhận gỡ 2FA thành công")}
              </h2>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                {message}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("reset2fa.backToDashboard", "Về trang tổng quan")}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-200">
              {action === "cancel" ? (
                <ShieldAlert className="h-8 w-8" />
              ) : (
                <AlertCircle className="h-8 w-8" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                {t("reset2fa.errorTitle", "Thao tác không thành công")}
              </h2>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                {message}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigate("/login")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("reset2fa.backToLogin", "Về trang đăng nhập")}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Reset2faPage;
