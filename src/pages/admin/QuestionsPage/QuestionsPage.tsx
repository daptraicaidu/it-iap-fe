import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Pencil,
  FileQuestion,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import adminQuestionService, {
  type QuestionEntity,
  type GetQuestionsParams,
  POSITION_OPTIONS,
  LEVEL_OPTIONS,
  CATEGORY_OPTIONS,
  SOURCE_OPTIONS,
  STATUS_OPTIONS,
} from "../../../services/admin/questionService";
import CreateQuestionModal from "./CreateQuestionModal";
import EditQuestionModal from "./EditQuestionModal";
import AIGenerateModal from "./AIGenerateModal";

// ── Status Badge ──
const StatusBadge = ({ status, label }: { status: string; label: string }) => {
  const styles: Record<string, string> = {
    APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        styles[status] || "border-zinc-200 bg-zinc-50 text-zinc-600"
      }`}
    >
      {label}
    </span>
  );
};

// ── Source Badge ──
const SourceBadge = ({ source }: { source: string }) => {
  const isAI = source === "AI";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        isAI
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border-zinc-200 bg-zinc-50 text-zinc-600"
      }`}
    >
      {source}
    </span>
  );
};

// ── Pagination Component ──
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const { t } = useTranslation("AdminQuestions");
  const [goToInput, setGoToInput] = useState("");

  const getVisiblePages = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];
    pages.push(1);

    if (currentPage > 4) {
      pages.push("ellipsis");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push("ellipsis");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handleGoTo = () => {
    const page = parseInt(goToInput, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setGoToInput("");
    }
  };

  const handleGoToKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGoTo();
    }
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-white"
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" strokeWidth={1.8} />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-white"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
        </button>

        {visiblePages.map((page, idx) =>
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
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-white"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-white"
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">{t("pagination.goToPage")}:</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={goToInput}
          onChange={(e) => setGoToInput(e.target.value)}
          onKeyDown={handleGoToKeyDown}
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
      <div className="h-4 w-8 rounded bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-4 w-48 rounded bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-4 w-32 rounded bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-4 w-28 rounded bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-5 w-16 rounded-full bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-5 w-14 rounded-full bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-5 w-16 rounded-full bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-5 w-12 rounded-full bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-5 w-16 rounded-full bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-4 w-10 rounded bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-5 w-20 rounded-full bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-8 w-8 rounded bg-zinc-200" />
    </td>
  </tr>
);

// ── Main Component ──
const QuestionsPage = () => {
  const { t } = useTranslation("AdminQuestions");

  // Data state
  const [questions, setQuestions] = useState<QuestionEntity[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filterContent, setFilterContent] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState<GetQuestionsParams>({});

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionEntity | null>(null);
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false);

  // Fetch questions
  const fetchQuestions = useCallback(async (page: number, filters: GetQuestionsParams) => {
    setLoading(true);
    try {
      const response = await adminQuestionService.getQuestions({
        ...filters,
        page,
        size: 10,
      });
      const data = response.data.data;
      if (data) {
        setQuestions(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setPageSize(data.size);
        setCurrentPage(data.number + 1);
      }
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions(1, appliedFilters);
  }, [fetchQuestions, appliedFilters]);

  // Handlers
  const handleSearch = () => {
    const filters: GetQuestionsParams = {};
    if (filterContent.trim()) filters.content = filterContent.trim();
    if (filterPosition) filters.position = filterPosition;
    if (filterLevel) filters.level = filterLevel;
    if (filterCategory) filters.category = filterCategory;
    if (filterSource) filters.source = filterSource;
    if (filterStatus) filters.status = filterStatus;
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilterContent("");
    setFilterPosition("");
    setFilterLevel("");
    setFilterCategory("");
    setFilterSource("");
    setFilterStatus("");
    setAppliedFilters({});
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    fetchQuestions(page, appliedFilters);
  };

  const handleCreateSuccess = () => {
    fetchQuestions(currentPage, appliedFilters);
  };

  const handleEditSuccess = () => {
    fetchQuestions(currentPage, appliedFilters);
  };

  const handleAIGenerateSuccess = () => {
    fetchQuestions(currentPage, appliedFilters);
  };

  const handleEditClick = (question: QuestionEntity) => {
    setEditingQuestion(question);
    setShowEditModal(true);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const hasActiveFilters =
    filterContent.trim() ||
    filterPosition ||
    filterLevel ||
    filterCategory ||
    filterSource ||
    filterStatus;

  const showingFrom = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingTo = Math.min(currentPage * pageSize, totalElements);


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-zinc-500">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAIGenerateModal(true)}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-sm font-medium text-white transition-all active:scale-[0.98]"
          >
            {/* Animated gradient background */}
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600 bg-[length:200%_100%] transition-all duration-700 ease-out group-hover:bg-[length:300%_100%] group-hover:animate-[shimmer_2s_linear_infinite]" />
            {/* Glow effect on hover */}
            <span className="absolute inset-0 rounded-full opacity-0 shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-opacity duration-500 group-hover:opacity-100" />
            {/* Shine sweep overlay */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
            <span className="relative flex items-center gap-2">
              <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
              {t("addQuestionAI")}
            </span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            {t("addQuestion")}
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Content search */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">
              {t("filter.content")}
            </label>
            <input
              type="text"
              value={filterContent}
              onChange={(e) => setFilterContent(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={t("filter.contentPlaceholder")}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          {/* Position */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">
              {t("filter.position")}
            </label>
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            >
              <option value="">{t("filter.allPositions")}</option>
              {POSITION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {t(`position.${opt}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Level */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">
              {t("filter.level")}
            </label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            >
              <option value="">{t("filter.allLevels")}</option>
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {t(`level.${opt}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">
              {t("filter.category")}
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            >
              <option value="">{t("filter.allCategories")}</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {t(`category.${opt}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Source */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">
              {t("filter.source")}
            </label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            >
              <option value="">{t("filter.allSources")}</option>
              {SOURCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {t(`source.${opt}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">
              {t("filter.status")}
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            >
              <option value="">{t("filter.allStatuses")}</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {t(`status.${opt}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={handleSearch}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 active:scale-[0.98]"
          >
            <Search className="h-3.5 w-3.5" strokeWidth={2} />
            {t("filter.search")}
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 active:scale-[0.98]"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
              {t("filter.clear")}
            </button>
          )}
        </div>
      </div>

      {/* Data Table Card */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/60">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.id")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.content")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.suggestedAnswer")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.hintContent")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.position")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.level")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.category")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.source")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.status")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.timeLimit")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.deleteAt")}
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
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
                        <FileQuestion className="h-6 w-6 text-zinc-400" strokeWidth={1.5} />
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
                questions.map((q) => (
                  <tr
                    key={q.id}
                    className="transition-colors hover:bg-zinc-50/60"
                  >
                    {/* ID */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium tabular-nums text-zinc-500">
                        #{q.id}
                      </span>
                    </td>

                    {/* Content */}
                    <td className="max-w-[280px] overflow-hidden px-4 py-3">
                      <p className="truncate text-sm text-zinc-900" title={q.content}>
                        {q.content}
                      </p>
                      {q.skillTag && q.skillTag.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {q.skillTag.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600"
                            >
                              {tag}
                            </span>
                          ))}
                          {q.skillTag.length > 3 && (
                            <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                              +{q.skillTag.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Suggested Answer */}
                    <td className="max-w-[200px] overflow-hidden px-4 py-3">
                      {q.suggestedAnswer ? (
                        <div>
                          <p className="truncate text-sm text-zinc-600" title={q.suggestedAnswer}>
                            {q.suggestedAnswer}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-300">—</span>
                      )}
                    </td>

                    {/* Hint Content */}
                    <td className="max-w-[200px] overflow-hidden px-4 py-3">
                      {q.hintContent ? (
                        <div>
                          <p className="truncate text-sm text-zinc-600" title={q.hintContent}>
                            {q.hintContent}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-300">—</span>
                      )}
                    </td>

                    {/* Position */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-600">
                        {t(`position.${q.position}`)}
                      </span>
                    </td>

                    {/* Level */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-600">
                        {t(`level.${q.level}`)}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-600">
                        {t(`category.${q.category}`)}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3">
                      <SourceBadge source={q.source} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={q.status}
                        label={t(`status.${q.status}`)}
                      />
                    </td>

                    {/* Time Limit */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-sm tabular-nums text-zinc-500">
                        <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {q.timeLimitSeconds}s
                      </span>
                    </td>

                    {/* Delete At */}
                    <td className="px-4 py-3">
                      {q.deleteAt ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                          <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                          {new Date(q.deleteAt).toLocaleDateString('vi-VN')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          {t("table.notDeleted")}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleEditClick(q)}
                          title={t("editModal.title")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 active:scale-[0.95]"
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {!loading && questions.length > 0 && (
          <div className="border-t border-zinc-200 px-4 py-4">
            <div className="mb-3 text-xs text-zinc-500">
              {t("pagination.showing")} {showingFrom} {t("pagination.to")} {showingTo}{" "}
              {t("pagination.of")} {totalElements} {t("pagination.entries")}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateQuestionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
      <EditQuestionModal
        isOpen={showEditModal}
        question={editingQuestion}
        onClose={() => {
          setShowEditModal(false);
          setEditingQuestion(null);
        }}
        onSuccess={handleEditSuccess}
      />
      <AIGenerateModal
        isOpen={showAIGenerateModal}
        onClose={() => setShowAIGenerateModal(false)}
        onSuccess={handleAIGenerateSuccess}
      />
    </div>
  );
};

export default QuestionsPage;
