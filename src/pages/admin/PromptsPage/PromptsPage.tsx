import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Plus,
  Eye,
  Zap,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import adminPromptService, {
  APPLY_FOR_OPTIONS,
  type PromptListItem,
  type GetPromptsParams,
} from "../../../services/admin/promptService";
import CreatePromptModal from "./CreatePromptModal";
import VersionDetailModal from "./VersionDetailModal";
import AddVersionModal from "./AddVersionModal";
import type { AxiosError } from "axios";
import type { PromptVersionDetail } from "../../../services/admin/promptService";

// ── Pagination Component ──
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const { t } = useTranslation("AdminPrompts");
  const [goToInput, setGoToInput] = useState("");

  const getVisiblePages = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [1];
    if (currentPage > 4) pages.push("ellipsis");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 3) pages.push("ellipsis");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const handleGoTo = () => {
    const page = parseInt(goToInput, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setGoToInput("");
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-30"
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" strokeWidth={1.8} />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
        </button>
        {getVisiblePages().map((page, idx) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-zinc-400"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-30"
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">
          {t("pagination.goToPage")}:
        </span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={goToInput}
          onChange={(e) => setGoToInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGoTo()}
          placeholder="—"
          className="h-9 w-16 rounded-lg border border-zinc-200 px-2 text-center text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-300 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
        />
        <button
          onClick={handleGoTo}
          className="rounded-full bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 active:scale-[0.98]"
        >
          {t("pagination.go")}
        </button>
      </div>
    </div>
  );
};

// ── Skeleton Row ──
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3.5">
      <div className="h-4 w-24 rounded bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-4 w-12 rounded bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-4 w-16 rounded bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-4 w-32 rounded bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-4 w-28 rounded bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-6 w-16 rounded-full bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-8 w-20 rounded bg-zinc-200" />
    </td>
  </tr>
);

// ── Main Component ──
const PromptsPage = () => {
  const { t } = useTranslation("AdminPrompts");

  // Data state
  const [prompts, setPrompts] = useState<PromptListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filterPromptKey, setFilterPromptKey] = useState("");
  const [filterApplyFor, setFilterApplyFor] = useState("");
  const [filterActive, setFilterActive] = useState<string>(""); // "" = all, "true" = active, "false" = inactive

  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState<GetPromptsParams>({});

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailPromptKey, setDetailPromptKey] = useState("");
  const [detailVersion, setDetailVersion] = useState("");
  const [showAddVersionModal, setShowAddVersionModal] = useState(false);
  const [addVersionPromptId, setAddVersionPromptId] = useState(0);
  const [addVersionPromptKey, setAddVersionPromptKey] = useState("");

  // Quick activate state
  const [confirmActivateItem, setConfirmActivateItem] =
    useState<PromptListItem | null>(null);
  const [activating, setActivating] = useState(false);

  // Fetch prompts
  const fetchPrompts = useCallback(
    async (page: number, filters: GetPromptsParams) => {
      setLoading(true);
      try {
        const response = await adminPromptService.getPrompts({
          ...filters,
          pages: page - 1, // Backend is 0-indexed
        });
        const data = response.data.data;
        if (data) {
          setPrompts(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
          setPageSize(data.size);
          setCurrentPage(data.number + 1);
        }
      } catch {
        setPrompts([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPrompts(1, appliedFilters);
  }, [fetchPrompts, appliedFilters]);

  // Handlers
  const handleSearch = () => {
    const filters: GetPromptsParams = {};
    if (filterPromptKey.trim()) filters.promptKey = filterPromptKey.trim();
    if (filterApplyFor) filters.applyFor = filterApplyFor;
    if (filterActive !== "") filters.active = filterActive === "true";
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilterPromptKey("");
    setFilterApplyFor("");
    setFilterActive("");
    setAppliedFilters({});
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    fetchPrompts(page, appliedFilters);
  };

  const handleViewDetail = (item: PromptListItem) => {
    setDetailPromptKey(item.promptKey);
    setDetailVersion(item.version);
    setShowDetailModal(true);
  };

  const handleAddVersion = (promptId: number, promptKey: string) => {
    setAddVersionPromptId(promptId);
    setAddVersionPromptKey(promptKey);
    // Keep detail modal open — both will show side by side
    setShowAddVersionModal(true);
  };

  const handleCloseAddVersion = () => {
    setShowAddVersionModal(false);
  };

  // In-memory cache for version detail (survives until page reload)
  const versionDetailCache = useRef<Map<string, PromptVersionDetail>>(new Map());

  const handleQuickActivate = async () => {
    if (!confirmActivateItem) return;
    setActivating(true);
    try {
      await adminPromptService.activateVersion({
        promptKey: confirmActivateItem.promptKey,
        version: confirmActivateItem.version,
      });
      fetchPrompts(currentPage, appliedFilters);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      console.error(axiosError.response?.data?.message);
    } finally {
      setActivating(false);
      setConfirmActivateItem(null);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const hasActiveFilters =
    filterPromptKey.trim() || filterApplyFor || filterActive !== "";

  const showingFrom =
    totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingTo = Math.min(currentPage * pageSize, totalElements);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-zinc-500">{t("subtitle")}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          {t("addPrompt")}
        </button>
      </div>

      {/* Filter Card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Prompt Key */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">
              {t("filter.promptKey")}
            </label>
            <input
              type="text"
              value={filterPromptKey}
              onChange={(e) => setFilterPromptKey(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={t("filter.promptKeyPlaceholder")}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          {/* Apply For */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">
              {t("filter.applyFor")}
            </label>
            <select
              value={filterApplyFor}
              onChange={(e) => setFilterApplyFor(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            >
              <option value="">{t("filter.applyForPlaceholder")}</option>
              {APPLY_FOR_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {t(`applyForLabels.${opt}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Active Status */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">
              {t("filter.active")}
            </label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            >
              <option value="">{t("filter.activeAll")}</option>
              <option value="true">{t("filter.activeTrue")}</option>
              <option value="false">{t("filter.activeFalse")}</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 active:scale-[0.98]"
            >
              <Search className="h-3.5 w-3.5" strokeWidth={2} />
              {t("filter.search")}
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 active:scale-[0.98]"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
                {t("filter.clear")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/60">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.promptKey")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.version")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.provider")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.model")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.applyFor")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.status")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : prompts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
                        <FileText
                          className="h-6 w-6 text-zinc-400"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-600">
                          {t("table.noData")}
                        </p>
                        <p className="mt-1 text-xs text-zinc-400">
                          {t("table.noDataDesc")}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                prompts.map((item) => (
                  <tr
                    key={`${item.promptKey}-${item.version}`}
                    className="transition-colors hover:bg-zinc-50/60"
                  >
                    {/* Prompt Key */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-zinc-900">
                        {item.promptKey}
                      </span>
                    </td>

                    {/* Version */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                        {item.version}
                      </span>
                    </td>

                    {/* Provider */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-600">
                        {item.provider}
                      </span>
                    </td>

                    {/* Model */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-600 font-mono text-xs">
                        {item.model}
                      </span>
                    </td>

                    {/* Apply For */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-600">
                        {t(`applyForLabels.${item.applyFor}`)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {item.active ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          {t("table.active")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                          {t("table.inactive")}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Detail */}
                        <button
                          onClick={() => handleViewDetail(item)}
                          title={t("table.viewDetail")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 active:scale-[0.95]"
                        >
                          <Eye
                            className="h-3.5 w-3.5"
                            strokeWidth={1.8}
                          />
                        </button>

                        {/* Quick Activate */}
                        {!item.active && (
                          <button
                            onClick={() => setConfirmActivateItem(item)}
                            title={t("table.activate")}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 active:scale-[0.95]"
                          >
                            <Zap
                              className="h-3.5 w-3.5"
                              strokeWidth={1.8}
                            />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {!loading && prompts.length > 0 && (
          <div className="border-t border-zinc-200 px-4 py-4">
            <div className="mb-3 text-xs text-zinc-500">
              {t("pagination.showing")} {showingFrom} {t("pagination.to")}{" "}
              {showingTo} {t("pagination.of")} {totalElements}{" "}
              {t("pagination.entries")}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Quick Activate Confirm Modal */}
      {confirmActivateItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            onClick={() => !activating && setConfirmActivateItem(null)}
          />
          <div className="relative w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-zinc-900">
              {t("confirmActivate.title")}
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              {t("confirmActivate.message")}
            </p>
            <p className="mt-1.5 text-sm font-medium text-zinc-900">
              {t("confirmActivate.promptInfo", {
                promptKey: confirmActivateItem.promptKey,
                version: confirmActivateItem.version,
              })}
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmActivateItem(null)}
                disabled={activating}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50"
              >
                {t("confirmActivate.cancel")}
              </button>
              <button
                onClick={handleQuickActivate}
                disabled={activating}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
              >
                {activating ? "..." : t("confirmActivate.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreatePromptModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => fetchPrompts(currentPage, appliedFilters)}
      />

      {/* Side-by-side mode: both Detail + AddVersion open together */}
      {showDetailModal && showAddVersionModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center gap-4 overflow-y-auto p-4 pt-16 pb-8">
          <div
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            onClick={() => {
              setShowDetailModal(false);
              setShowAddVersionModal(false);
            }}
          />
          <VersionDetailModal
            isOpen
            promptKey={detailPromptKey}
            version={detailVersion}
            onClose={() => setShowDetailModal(false)}
            onActivateSuccess={() => fetchPrompts(currentPage, appliedFilters)}
            onAddVersion={handleAddVersion}
            cache={versionDetailCache.current}
            renderMode="inline"
          />
          <AddVersionModal
            isOpen
            adminPromptId={addVersionPromptId}
            promptKey={addVersionPromptKey}
            onClose={handleCloseAddVersion}
            onSuccess={() => fetchPrompts(currentPage, appliedFilters)}
            renderMode="inline"
          />
        </div>
      )}

      {/* Standalone Detail modal (only when AddVersion is NOT open) */}
      {showDetailModal && !showAddVersionModal && (
        <VersionDetailModal
          isOpen
          promptKey={detailPromptKey}
          version={detailVersion}
          onClose={() => setShowDetailModal(false)}
          onActivateSuccess={() => fetchPrompts(currentPage, appliedFilters)}
          onAddVersion={handleAddVersion}
          cache={versionDetailCache.current}
          renderMode="modal"
        />
      )}

      {/* Standalone AddVersion modal (only when Detail is NOT open) */}
      {!showDetailModal && showAddVersionModal && (
        <AddVersionModal
          isOpen
          adminPromptId={addVersionPromptId}
          promptKey={addVersionPromptKey}
          onClose={handleCloseAddVersion}
          onSuccess={() => fetchPrompts(currentPage, appliedFilters)}
          renderMode="modal"
        />
      )}
    </div>
  );
};

export default PromptsPage;
