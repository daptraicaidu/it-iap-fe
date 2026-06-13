import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Pencil,
  ShieldCheck,
  ShieldOff,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import adminUserService, {
  type UserEntity,
  type GetUsersParams,
  type UpdateUserRequest,
} from "../../../services/admin/userService";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";

// Default avatar imports
import avatarDefault1 from "../../../assets/avatardefault/avatar1.png";
import avatarDefault2 from "../../../assets/avatardefault/avatar2.png";
import avatarDefault3 from "../../../assets/avatardefault/avatar3.png";
import avatarDefault4 from "../../../assets/avatardefault/avatar4.png";
import avatarDefault5 from "../../../assets/avatardefault/avatar5.png";

const DEFAULT_AVATARS = [
  avatarDefault1,
  avatarDefault2,
  avatarDefault3,
  avatarDefault4,
  avatarDefault5,
];

// Get a consistent default avatar based on user ID
const getDefaultAvatar = (userId: string): string => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[index];
};

// ── Pagination Component ──
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const { t } = useTranslation("AdminUsers");
  const [goToInput, setGoToInput] = useState("");

  const getVisiblePages = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];

    // Always show first page
    pages.push(1);

    if (currentPage > 4) {
      pages.push("ellipsis");
    }

    // Pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push("ellipsis");
    }

    // Always show last page
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
      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* First */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-white"
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" strokeWidth={1.8} />
        </button>

        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-white"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
        </button>

        {/* Page numbers */}
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

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-white"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
        </button>

        {/* Last */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-white"
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>

      {/* Go to page input */}
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
      <div className="h-9 w-9 rounded-full bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-4 w-28 rounded bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-4 w-36 rounded bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-4 w-24 rounded bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-6 w-16 rounded-full bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-4 w-28 rounded bg-zinc-200" />
    </td>
    <td className="px-4 py-3.5">
      <div className="h-8 w-20 rounded bg-zinc-200" />
    </td>
  </tr>
);

// ── Main Component ──
const UsersPage = () => {
  const { t } = useTranslation("AdminUsers");

  // Data state
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filterEmail, setFilterEmail] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterName, setFilterName] = useState("");

  // Applied filters (only updated on search click)
  const [appliedFilters, setAppliedFilters] = useState<GetUsersParams>({});

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserEntity | null>(null);

  // Confirm toggle state
  const [confirmToggleUser, setConfirmToggleUser] = useState<UserEntity | null>(null);
  const [toggling, setToggling] = useState(false);

  // Fetch users
  const fetchUsers = useCallback(async (page: number, filters: GetUsersParams) => {
    setLoading(true);
    try {
      const response = await adminUserService.getUsers({
        ...filters,
        pages: page,
      });
      const data = response.data.data;
      if (data) {
        setUsers(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setPageSize(data.size);
        // Backend pageNumber is 0-based, our UI is 1-based
        setCurrentPage(data.number + 1);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1, appliedFilters);
  }, [fetchUsers, appliedFilters]);

  // Handlers
  const handleSearch = () => {
    const filters: GetUsersParams = {};
    if (filterEmail.trim()) filters.email = filterEmail.trim();
    if (filterPhone.trim()) filters.phoneNumber = filterPhone.trim();
    if (filterName.trim()) filters.fullName = filterName.trim();
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilterEmail("");
    setFilterPhone("");
    setFilterName("");
    setAppliedFilters({});
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page, appliedFilters);
  };

  const handleCreateSuccess = () => {
    fetchUsers(currentPage, appliedFilters);
  };

  const handleEditSuccess = () => {
    fetchUsers(currentPage, appliedFilters);
  };

  const handleEditClick = (user: UserEntity) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleToggleClick = (user: UserEntity) => {
    setConfirmToggleUser(user);
  };

  const handleConfirmToggle = async () => {
    if (!confirmToggleUser) return;
    setToggling(true);
    try {
      const payload: UpdateUserRequest = {
        email: confirmToggleUser.email,
        fullName: confirmToggleUser.fullName,
        phoneNumber: confirmToggleUser.phoneNumber,
        avatarUrl: confirmToggleUser.avatarUrl || "",
        active: !confirmToggleUser.active,
      };
      await adminUserService.updateUser(confirmToggleUser.id, payload);
      fetchUsers(currentPage, appliedFilters);
    } catch {
      // silently fail, user can retry
    } finally {
      setToggling(false);
      setConfirmToggleUser(null);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const hasActiveFilters =
    filterEmail.trim() || filterPhone.trim() || filterName.trim();

  // Calculate showing range
  const showingFrom = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
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
          {t("addUser")}
        </button>
      </div>

      {/* Filter Card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Email filter */}
          <div className="relative">
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">
              {t("filter.email")}
            </label>
            <input
              type="text"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={t("filter.emailPlaceholder")}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          {/* Phone filter */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">
              {t("filter.phone")}
            </label>
            <input
              type="text"
              value={filterPhone}
              onChange={(e) => setFilterPhone(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={t("filter.phonePlaceholder")}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          {/* Name filter */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">
              {t("filter.name")}
            </label>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={t("filter.namePlaceholder")}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
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
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/60">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.avatar")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.fullName")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.email")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.phone")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.status")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t("table.createdAt")}
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
                        <Users className="h-6 w-6 text-zinc-400" strokeWidth={1.5} />
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
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-zinc-50/60"
                  >
                    {/* Avatar */}
                    <td className="px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-zinc-100">
                        <img
                          src={user.avatarUrl || getDefaultAvatar(user.id)}
                          alt={user.fullName}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getDefaultAvatar(user.id);
                          }}
                        />
                      </div>
                    </td>

                    {/* Full Name */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-zinc-900">
                        {user.fullName}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-600">{user.email}</span>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-600 tabular-nums">
                        {user.phoneNumber}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {user.active ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          {t("table.active")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                          {t("table.inactive")}
                        </span>
                      )}
                    </td>

                    {/* Created At */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-500 tabular-nums">
                        {user.createAt}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit */}
                        <button
                          onClick={() => handleEditClick(user)}
                          title={t("editModal.title")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 active:scale-[0.95]"
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </button>

                        {/* Toggle Active/Inactive */}
                        <button
                          onClick={() => handleToggleClick(user)}
                          title={
                            user.active
                              ? t("confirmToggle.deactivateTitle")
                              : t("confirmToggle.activateTitle")
                          }
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors active:scale-[0.95] ${
                            user.active
                              ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                        >
                          {user.active ? (
                            <ShieldOff className="h-3.5 w-3.5" strokeWidth={1.8} />
                          ) : (
                            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Showing info + Pagination */}
        {!loading && users.length > 0 && (
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

      {/* Confirm Toggle Modal */}
      {confirmToggleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            onClick={() => !toggling && setConfirmToggleUser(null)}
          />
          <div className="relative w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-zinc-900">
              {confirmToggleUser.active
                ? t("confirmToggle.deactivateTitle")
                : t("confirmToggle.activateTitle")}
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              {confirmToggleUser.active
                ? t("confirmToggle.deactivateDesc")
                : t("confirmToggle.activateDesc")}
            </p>
            <p className="mt-1.5 text-sm font-medium text-zinc-900">
              {confirmToggleUser.fullName} ({confirmToggleUser.email})
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmToggleUser(null)}
                disabled={toggling}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50"
              >
                {t("confirmToggle.cancel")}
              </button>
              <button
                onClick={handleConfirmToggle}
                disabled={toggling}
                className={`rounded-full px-4 py-2 text-sm font-medium text-white transition-colors active:scale-[0.98] disabled:opacity-50 ${
                  confirmToggleUser.active
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {toggling ? "..." : t("confirmToggle.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
      <EditUserModal
        isOpen={showEditModal}
        user={editingUser}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default UsersPage;
