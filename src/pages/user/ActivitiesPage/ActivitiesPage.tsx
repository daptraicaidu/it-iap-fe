import React, { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity,
  RefreshCw,
  LogIn,
  KeyRound,
  Lock,
  UserCheck,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  Check,
} from "lucide-react";
import userActivityService, {
  type UserActivityItem,
  type UserActivitiesResponse,
  type UserActionType,
} from "../../../services/user/userActivityService";

const ACTION_TYPES: { code: UserActionType; labelKey: string }[] = [
  { code: "", labelKey: "filterAll" },
  { code: "LOGIN", labelKey: "types.LOGIN" },
  { code: "CHANGE_PASSWORD", labelKey: "types.CHANGE_PASSWORD" },
  { code: "RESET_PASSWORD", labelKey: "types.RESET_PASSWORD" },
  { code: "UPDATE_PROFILE", labelKey: "types.UPDATE_PROFILE" },
  { code: "DELETE_PROFILE", labelKey: "types.DELETE_PROFILE" },
  { code: "ENABLE_2FA", labelKey: "types.ENABLE_2FA" },
  { code: "DISABLE_2FA", labelKey: "types.DISABLE_2FA" },
];

const getActionBadge = (actionType: string, t: (k: string) => string) => {
  const code = actionType?.toUpperCase();

  switch (code) {
    case "LOGIN":
      return {
        icon: <LogIn className="h-4 w-4 text-sky-600" />,
        badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
        label: t("settings.activities.types.LOGIN"),
      };
    case "CHANGE_PASSWORD":
      return {
        icon: <KeyRound className="h-4 w-4 text-amber-600" />,
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        label: t("settings.activities.types.CHANGE_PASSWORD"),
      };
    case "RESET_PASSWORD":
      return {
        icon: <Lock className="h-4 w-4 text-amber-600" />,
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        label: t("settings.activities.types.RESET_PASSWORD"),
      };
    case "UPDATE_PROFILE":
      return {
        icon: <UserCheck className="h-4 w-4 text-indigo-600" />,
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
        label: t("settings.activities.types.UPDATE_PROFILE"),
      };
    case "DELETE_PROFILE":
      return {
        icon: <Trash2 className="h-4 w-4 text-rose-600" />,
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        label: t("settings.activities.types.DELETE_PROFILE"),
      };
    case "ENABLE_2FA":
      return {
        icon: <ShieldCheck className="h-4 w-4 text-emerald-600" />,
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: t("settings.activities.types.ENABLE_2FA"),
      };
    case "DISABLE_2FA":
      return {
        icon: <ShieldAlert className="h-4 w-4 text-rose-600" />,
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        label: t("settings.activities.types.DISABLE_2FA"),
      };
    default:
      return {
        icon: <Activity className="h-4 w-4 text-zinc-500" />,
        badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
        label: actionType || "N/A",
      };
  }
};

const ActivitiesPage: React.FC = () => {
  const { t } = useTranslation("Profile");

  const [selectedType, setSelectedType] = useState<UserActionType>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [data, setData] = useState<UserActivitiesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchActivities = useCallback(
    async (type: UserActionType, pageNum: number) => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await userActivityService.getUserActivities({
          actionType: type,
          page: pageNum,
        });

        if (res.data?.data) {
          setData(res.data.data);
        } else {
          setData(null);
        }
      } catch (err: unknown) {
        console.error("Failed to load user activities:", err);
        setErrorMsg("Không thể tải lịch sử hoạt động. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchActivities(selectedType, currentPage);
  }, [selectedType, currentPage, fetchActivities]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTypeSelect = (type: UserActionType) => {
    setSelectedType(type);
    setCurrentPage(1);
    setIsDropdownOpen(false);
  };

  const handleRefresh = () => {
    fetchActivities(selectedType, currentPage);
  };

  const activities: UserActivityItem[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  const currentTypeConfig = ACTION_TYPES.find((item) => item.code === selectedType) || ACTION_TYPES[0];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-xs">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
              {t("settings.activities.title")}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-xl">
              {t("settings.activities.description")}
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          type="button"
          disabled={loading}
          onClick={handleRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-95 shadow-xs cursor-pointer disabled:opacity-50 w-fit"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-zinc-500 ${loading ? "animate-spin" : ""}`} />
          <span>{t("settings.activities.refresh")}</span>
        </button>
      </div>

      {/* Filter Toolbar: Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
          <Filter className="h-3.5 w-3.5 text-blue-400" />
          <span>{t("settings.activities.filterLabel")}:</span>
        </div>

        {/* Action Type Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="inline-flex items-center justify-between gap-3 min-w-[240px] rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-900 shadow-xs transition hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              {selectedType ? (
                getActionBadge(selectedType, t).icon
              ) : (
                <Activity className="h-3.5 w-3.5 text-zinc-500" />
              )}
              <span className="truncate font-semibold">
                {t(`settings.activities.${currentTypeConfig.labelKey}`)}
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 sm:right-auto sm:left-0 top-full z-30 mt-2 w-72 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="max-h-72 overflow-y-auto space-y-0.5">
                {ACTION_TYPES.map((item) => {
                  const isSelected = selectedType === item.code;
                  const badge = item.code ? getActionBadge(item.code, t) : null;

                  return (
                    <button
                      key={item.code || "ALL"}
                      type="button"
                      onClick={() => handleTypeSelect(item.code)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition cursor-pointer ${
                        isSelected
                          ? "bg-zinc-100 font-semibold text-zinc-900"
                          : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {badge ? (
                          badge.icon
                        ) : (
                          <Activity className="h-4 w-4 text-zinc-400" />
                        )}
                        <span className="truncate">
                          {t(`settings.activities.${item.labelKey}`)}
                        </span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-zinc-900 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Content: List of activities */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-zinc-400">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-600 mb-2.5" />
            <p className="text-xs font-medium text-zinc-500">Đang tải nhật ký hoạt động...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-800">
              {t("settings.activities.emptyTitle")}
            </h3>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              {t("settings.activities.emptyDescription")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {activities.map((item) => {
              const badge = getActionBadge(item.actionType, t);

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-5 hover:bg-zinc-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-50 border border-zinc-200/80 shadow-2xs mt-0.5">
                      {badge.icon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${badge.badgeClass}`}
                        >
                          {badge.label}
                        </span>
                        {/* <span className="font-mono text-[11px] text-zinc-400">
                          #{item.id}
                        </span> */}
                      </div>

                      <p className="text-sm font-medium text-zinc-900 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Created At Timestamp */}
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 shrink-0 font-mono self-end sm:self-center bg-zinc-50/90 px-2.5 py-1 rounded-md border border-zinc-200/60">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{item.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div className="text-xs text-zinc-500">
            <span>{t("settings.activities.pagination.showing")} </span>
            <span className="font-semibold text-zinc-800">
              {(currentPage - 1) * (data?.pageable?.pageSize ?? 10) + 1}
            </span>
            <span> {t("settings.activities.pagination.to")} </span>
            <span className="font-semibold text-zinc-800">
              {Math.min(
                currentPage * (data?.pageable?.pageSize ?? 10),
                totalElements
              )}
            </span>
            <span> {t("settings.activities.pagination.of")} </span>
            <span className="font-semibold text-zinc-800">{totalElements}</span>
            <span> {t("settings.activities.pagination.results")}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>{t("settings.activities.pagination.prev")}</span>
            </button>

            <span className="text-xs font-bold text-zinc-800 px-2">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 transition-all cursor-pointer"
            >
              <span>{t("settings.activities.pagination.next")}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesPage;
