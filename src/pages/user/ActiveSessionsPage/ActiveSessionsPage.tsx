import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Globe,
  MapPin,
  Clock,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import sessionService, {
  type UserSession,
} from "../../../services/user/sessionService";
import useAuthStore from "../../../store/authStore";
import ConfirmDialog from "../../../components/ConfirmDialog";

// ── Toast Notification Component ──
interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={[
        "fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg border transition-all",
        type === "success"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-rose-50 text-rose-700 border-rose-200",
      ].join(" ")}
    >
      {type === "success" ? (
        <CheckCircle2 className="h-5 w-5 shrink-0" />
      ) : (
        <AlertCircle className="h-5 w-5 shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 rounded-full p-0.5 hover:bg-black/5 transition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const ActiveSessionsPage = () => {
  const { t } = useTranslation("Profile");
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Dialog states
  const [selectedSession, setSelectedSession] = useState<UserSession | null>(
    null
  );
  const [showConfirmOthers, setShowConfirmOthers] = useState<boolean>(false);

  // Load active sessions
  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await sessionService.getSessions();
      const sessionList = res.data.data ?? [];
      setSessions(sessionList);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("sessions.messages.loadError");
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Helper to choose device icon
  const getDeviceIcon = (deviceType: string) => {
    const typeLower = deviceType.toLowerCase();
    if (typeLower.includes("mobile") || typeLower.includes("phone")) {
      return <Smartphone className="h-6 w-6 text-zinc-600" />;
    }
    if (typeLower.includes("tablet") || typeLower.includes("ipad")) {
      return <Tablet className="h-6 w-6 text-zinc-600" />;
    }
    if (typeLower.includes("desktop")) {
      return <Laptop className="h-6 w-6 text-zinc-600" />;
    }
    return <Monitor className="h-6 w-6 text-zinc-600" />;
  };

  // Helper to format timestamp
  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return isoString;
    }
  };

  // Revoke single session
  const handleRevokeSession = async (session: UserSession) => {
    setSelectedSession(null);
    setActionLoadingId(session.id);
    try {
      const res = await sessionService.revokeSession(session.id);
      if (res.data.code === 200 || res.status === 200) {
        if (session.isCurrent) {
          clearAuth();
          navigate("/login", { replace: true });
          return;
        }
        setToast({
          message:
            res.data.message || t("sessions.messages.revokeSuccess"),
          type: "success",
        });
        setSessions((prev) => prev.filter((s) => s.id !== session.id));
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("sessions.messages.revokeError");
      setToast({ message: msg, type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Revoke all other sessions
  const handleRevokeOtherSessions = async () => {
    setShowConfirmOthers(false);
    setActionLoadingId("others");
    try {
      const res = await sessionService.revokeOtherSessions();
      if (res.data.code === 200 || res.status === 200) {
        setToast({
          message:
            res.data.message || t("sessions.messages.revokeOthersSuccess"),
          type: "success",
        });
        // Keep only current session
        setSessions((prev) => prev.filter((s) => s.isCurrent));
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("sessions.messages.revokeOthersError");
      setToast({ message: msg, type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const hasOtherSessions = sessions.some((s) => !s.isCurrent);

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            {t("sessions.title")}
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            {t("sessions.description")}
          </p>
        </div>

        {hasOtherSessions && (
          <button
            type="button"
            onClick={() => setShowConfirmOthers(true)}
            disabled={actionLoadingId !== null}
            className="shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 hover:border-rose-200 disabled:opacity-50 flex items-center gap-2"
          >
            {actionLoadingId === "others" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("sessions.revokingAll")}
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                {t("sessions.revokeAllOthers")}
              </>
            )}
          </button>
        )}
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
          <Monitor className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-4 text-base font-semibold text-zinc-900">
            {t("sessions.emptyTitle")}
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            {t("sessions.emptyDescription")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={[
                "rounded-xl border bg-white p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                session.isCurrent
                  ? "border-emerald-200 shadow-sm"
                  : "border-zinc-200 hover:border-zinc-300",
              ].join(" ")}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                  {getDeviceIcon(session.deviceType)}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-zinc-900 text-base">
                      {session.browserName || "Unknown Browser"}
                    </span>
                    <span className="text-sm text-zinc-500">•</span>
                    <span className="text-sm font-medium text-zinc-700">
                      {session.osName || "Unknown OS"}
                    </span>

                    {session.isCurrent && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t("sessions.currentDevice")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{session.ipAddress}</span>
                    </div>

                    {session.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{session.location}</span>
                      </div>
                    )}

                    {session.lastActiveAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-zinc-400" />
                        <span>
                          {t("sessions.lastActive")}:{" "}
                          {formatDate(session.lastActiveAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end sm:justify-center">
                <button
                  type="button"
                  onClick={() => setSelectedSession(session)}
                  disabled={actionLoadingId !== null}
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-medium transition flex items-center gap-2 disabled:opacity-50",
                    session.isCurrent
                      ? "border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                      : "border-zinc-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200",
                  ].join(" ")}
                >
                  {actionLoadingId === session.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("sessions.revoking")}
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      {t("sessions.revoke")}
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Single session revoke confirmation dialog */}
      <ConfirmDialog
        isOpen={selectedSession !== null}
        title={t("sessions.confirmRevokeOneTitle")}
        message={
          selectedSession?.isCurrent
            ? t("sessions.confirmRevokeCurrentDesc")
            : t("sessions.confirmRevokeOneDesc")
        }
        confirmText={t("sessions.revoke")}
        cancelText={t("info.actions.cancel")}
        variant="warning"
        onConfirm={() => {
          if (selectedSession) handleRevokeSession(selectedSession);
        }}
        onCancel={() => setSelectedSession(null)}
      />

      {/* Revoke all other sessions confirmation dialog */}
      <ConfirmDialog
        isOpen={showConfirmOthers}
        title={t("sessions.confirmRevokeOthersTitle")}
        message={t("sessions.confirmRevokeOthersDesc")}
        confirmText={t("sessions.revokeAllOthers")}
        cancelText={t("info.actions.cancel")}
        variant="warning"
        onConfirm={handleRevokeOtherSessions}
        onCancel={() => setShowConfirmOthers(false)}
      />
    </div>
  );
};

export default ActiveSessionsPage;
