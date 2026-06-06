import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  BriefcaseBusiness,
  FileText,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import profileService, {
  getProfileTitle,
  type ProfileDetail,
  type ProfilePayload,
  type ProfileSummary,
  type ResumeData,
} from "../../../services/user/profileService";

const emptyResumeData = (): ResumeData => ({
  skills: [{ name: "", level: "", years: 0 }],
  experiences: [{ position: "", descriptions: [""] }],
  projects: [{ name: "", role: "", technologies: [""], descriptions: [""] }],
});

const targetPositionOptions = [
  { value: "FRONTEND", label: "Frontend" },
  { value: "BACKEND", label: "Backend" },
  { value: "TESTER", label: "Tester" },
  { value: "DATA_ANALYST", label: "Data Analyst" },
];

const targetLevelOptions = [
  { value: "INTERN", label: "Intern" },
  { value: "FRESHER", label: "Fresher" },
];

const createEmptyPayload = (): ProfilePayload => ({
  title: "",
  targetPosition: "",
  targetLevel: "",
  resumeData: emptyResumeData(),
});

const normalizeOptionValue = (
  value: string | undefined,
  options: Array<{ value: string; label: string }>
) => {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return "";
  }

  const matchedOption = options.find(
    (option) =>
      option.value.toLowerCase() === normalizedValue.toLowerCase() ||
      option.label.toLowerCase() === normalizedValue.toLowerCase()
  );

  return matchedOption?.value ?? normalizedValue;
};

const normalizeProfile = (profile: ProfileDetail): ProfilePayload => ({
  title: getProfileTitle(profile),
  targetPosition: normalizeOptionValue(
    profile.targetPosition,
    targetPositionOptions
  ),
  targetLevel: normalizeOptionValue(profile.targetLevel, targetLevelOptions),
  resumeData: {
    skills:
      profile.resumeData?.skills?.length > 0
        ? profile.resumeData.skills
        : emptyResumeData().skills,
    experiences:
      profile.resumeData?.experiences?.length > 0
        ? profile.resumeData.experiences
        : emptyResumeData().experiences,
    projects:
      profile.resumeData?.projects?.length > 0
        ? profile.resumeData.projects
        : emptyResumeData().projects,
  },
});

const toLines = (values: string[]) => values.join("\n");

const fromLines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const ProfileManagePage = () => {
  const { t } = useTranslation("Profile");
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(
    null
  );
  const [form, setForm] = useState<ProfilePayload>(createEmptyPayload);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedTitle = useMemo(() => {
    const selected = profiles.find((profile) => profile.id === selectedProfileId);
    return selected ? getProfileTitle(selected) : "";
  }, [profiles, selectedProfileId]);

  const loadProfiles = async (nextSelectedId?: number) => {
    setIsLoadingList(true);
    setError(null);

    try {
      const response = await profileService.getProfiles();
      const items = response.data.data ?? [];
      setProfiles(items);

      const fallbackId = items[0]?.id ?? null;
      setSelectedProfileId(nextSelectedId ?? fallbackId);

      if (!nextSelectedId && fallbackId === null) {
        setIsCreating(true);
        setForm(createEmptyPayload());
      }
    } catch {
      setError(t("messages.loadListError"));
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    void loadProfiles();
  }, []);

  useEffect(() => {
    if (selectedProfileId === null || isCreating) {
      return;
    }

    const loadProfileDetail = async () => {
      setIsLoadingDetail(true);
      setError(null);

      try {
        const response = await profileService.getProfile(selectedProfileId);
        setForm(normalizeProfile(response.data.data));
      } catch {
        setError(t("messages.loadDetailError"));
      } finally {
        setIsLoadingDetail(false);
      }
    };

    void loadProfileDetail();
  }, [isCreating, selectedProfileId, t]);

  const updateResumeData = (resumeData: ResumeData) => {
    setForm((current) => ({ ...current, resumeData }));
  };

  const handleCreateNew = () => {
    setSelectedProfileId(null);
    setIsCreating(true);
    setForm(createEmptyPayload());
    setMessage(null);
    setError(null);
  };

  const handleSelectProfile = (profileId: number) => {
    setSelectedProfileId(profileId);
    setIsCreating(false);
    setMessage(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError(t("messages.titleRequired"));
      return;
    }

    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const payload: ProfilePayload = {
        ...form,
        title: form.title.trim(),
        targetPosition: form.targetPosition.trim(),
        targetLevel: form.targetLevel.trim(),
      };

      const response =
        isCreating || selectedProfileId === null
          ? await profileService.createProfile(payload)
          : await profileService.updateProfile(selectedProfileId, payload);

      const savedProfile = response.data.data;
      setIsCreating(false);
      setSelectedProfileId(savedProfile.id);
      setForm(normalizeProfile(savedProfile));
      await loadProfiles(savedProfile.id);
      setMessage(t("messages.saveSuccess"));
    } catch {
      setError(t("messages.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedProfileId === null || isCreating) {
      return;
    }

    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedProfileId === null || isCreating) {
      return;
    }

    setIsDeleting(true);
    setMessage(null);
    setError(null);

    try {
      await profileService.deleteProfile(selectedProfileId);
      setForm(createEmptyPayload());
      setSelectedProfileId(null);
      setIsDeleteDialogOpen(false);
      await loadProfiles();
      setMessage(t("messages.deleteSuccess"));
    } catch {
      setError(t("messages.deleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-zinc-50 text-zinc-900">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900"
            >
              <ArrowLeft className="h-4 w-4 text-zinc-500" />
              {t("common.backToDashboard")}
            </Link>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-900">
              {t("manage.title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              {t("manage.description")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {t("actions.create")}
          </button>
        </div>

        {(message || error) && (
          <div
            className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error ?? message}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-xl border border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">
                  {t("list.title")}
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {t("list.count", { count: profiles.length })}
                </p>
              </div>
              {isLoadingList && (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
              )}
            </div>

            <div className="max-h-[560px] divide-y divide-zinc-200 overflow-y-auto">
              {profiles.length === 0 && !isLoadingList ? (
                <div className="px-5 py-8 text-sm leading-6 text-zinc-600">
                  {t("list.empty")}
                </div>
              ) : (
                profiles.map((profile) => {
                  const isActive = profile.id === selectedProfileId && !isCreating;

                  return (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => handleSelectProfile(profile.id)}
                      className={`flex w-full items-center gap-3 px-5 py-4 text-left transition ${
                        isActive ? "bg-indigo-50" : "hover:bg-zinc-50"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          isActive
                            ? "bg-white text-indigo-600"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        <FileText className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-zinc-900">
                          {getProfileTitle(profile) || t("list.untitled")}
                        </span>
                        <span className="mt-1 block text-xs text-zinc-500">
                          #{profile.id}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="rounded-xl border border-zinc-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium text-indigo-600">
                  {isCreating ? t("form.modeCreate") : t("form.modeEdit")}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-900">
                  {isCreating
                    ? t("form.newProfile")
                  : selectedTitle || t("list.untitled")}
                </h2>
              </div>
            </div>

            {isLoadingDetail ? (
              <div className="flex min-h-[420px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
              </div>
            ) : (
              <div className="space-y-6 p-5 sm:p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Field
                    label={t("fields.title")}
                    value={form.title}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, title: value }))
                    }
                  />
                  <SelectField
                    label={t("fields.targetPosition")}
                    value={form.targetPosition}
                    placeholder={t("fields.targetPositionPlaceholder")}
                    options={targetPositionOptions}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        targetPosition: value,
                      }))
                    }
                  />
                  <SelectField
                    label={t("fields.targetLevel")}
                    value={form.targetLevel}
                    placeholder={t("fields.targetLevelPlaceholder")}
                    options={targetLevelOptions}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, targetLevel: value }))
                    }
                  />
                </div>

                <div className="rounded-xl border border-zinc-200">
                  <SectionHeader
                    icon={<BriefcaseBusiness className="h-4 w-4" />}
                    title={t("sections.skills")}
                    actionLabel={t("actions.addSkill")}
                    onAdd={() =>
                      updateResumeData({
                        ...form.resumeData,
                        skills: [
                          ...form.resumeData.skills,
                          { name: "", level: "", years: 0 },
                        ],
                      })
                    }
                  />
                  <div className="divide-y divide-zinc-200">
                    {form.resumeData.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_180px_120px_40px]"
                      >
                        <Field
                          label={t("fields.skillName")}
                          value={skill.name}
                          onChange={(value) => {
                            const skills = [...form.resumeData.skills];
                            skills[index] = { ...skill, name: value };
                            updateResumeData({ ...form.resumeData, skills });
                          }}
                        />
                        <Field
                          label={t("fields.skillLevel")}
                          value={skill.level}
                          onChange={(value) => {
                            const skills = [...form.resumeData.skills];
                            skills[index] = { ...skill, level: value };
                            updateResumeData({ ...form.resumeData, skills });
                          }}
                        />
                        <Field
                          label={t("fields.skillYears")}
                          type="number"
                          value={String(skill.years)}
                          onChange={(value) => {
                            const skills = [...form.resumeData.skills];
                            skills[index] = {
                              ...skill,
                              years: Number(value) || 0,
                            };
                            updateResumeData({ ...form.resumeData, skills });
                          }}
                        />
                        <RemoveButton
                          label={t("actions.remove")}
                          onClick={() =>
                            updateResumeData({
                              ...form.resumeData,
                              skills: form.resumeData.skills.filter(
                                (_, itemIndex) => itemIndex !== index
                              ),
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <ResumeCollectionEditor
                  title={t("sections.experiences")}
                  actionLabel={t("actions.addExperience")}
                  items={form.resumeData.experiences}
                  renderItem={(experience, index) => (
                    <div className="grid gap-3 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)_40px]">
                      <Field
                        label={t("fields.position")}
                        value={experience.position}
                        onChange={(value) => {
                          const experiences = [...form.resumeData.experiences];
                          experiences[index] = {
                            ...experience,
                            position: value,
                          };
                          updateResumeData({
                            ...form.resumeData,
                            experiences,
                          });
                        }}
                      />
                      <TextareaField
                        label={t("fields.descriptions")}
                        value={toLines(experience.descriptions)}
                        onChange={(value) => {
                          const experiences = [...form.resumeData.experiences];
                          experiences[index] = {
                            ...experience,
                            descriptions: fromLines(value),
                          };
                          updateResumeData({
                            ...form.resumeData,
                            experiences,
                          });
                        }}
                      />
                      <RemoveButton
                        label={t("actions.remove")}
                        onClick={() =>
                          updateResumeData({
                            ...form.resumeData,
                            experiences: form.resumeData.experiences.filter(
                              (_, itemIndex) => itemIndex !== index
                            ),
                          })
                        }
                      />
                    </div>
                  )}
                  onAdd={() =>
                    updateResumeData({
                      ...form.resumeData,
                      experiences: [
                        ...form.resumeData.experiences,
                        { position: "", descriptions: [""] },
                      ],
                    })
                  }
                />

                <ResumeCollectionEditor
                  title={t("sections.projects")}
                  actionLabel={t("actions.addProject")}
                  items={form.resumeData.projects}
                  renderItem={(project, index) => (
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field
                        label={t("fields.projectName")}
                        value={project.name}
                        onChange={(value) => {
                          const projects = [...form.resumeData.projects];
                          projects[index] = { ...project, name: value };
                          updateResumeData({ ...form.resumeData, projects });
                        }}
                      />
                      <Field
                        label={t("fields.projectRole")}
                        value={project.role}
                        onChange={(value) => {
                          const projects = [...form.resumeData.projects];
                          projects[index] = { ...project, role: value };
                          updateResumeData({ ...form.resumeData, projects });
                        }}
                      />
                      <TextareaField
                        label={t("fields.technologies")}
                        value={toLines(project.technologies)}
                        onChange={(value) => {
                          const projects = [...form.resumeData.projects];
                          projects[index] = {
                            ...project,
                            technologies: fromLines(value),
                          };
                          updateResumeData({ ...form.resumeData, projects });
                        }}
                      />
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_40px]">
                        <TextareaField
                          label={t("fields.descriptions")}
                          value={toLines(project.descriptions)}
                          onChange={(value) => {
                            const projects = [...form.resumeData.projects];
                            projects[index] = {
                              ...project,
                              descriptions: fromLines(value),
                            };
                            updateResumeData({ ...form.resumeData, projects });
                          }}
                        />
                        <RemoveButton
                          label={t("actions.remove")}
                          onClick={() =>
                            updateResumeData({
                              ...form.resumeData,
                              projects: form.resumeData.projects.filter(
                                (_, itemIndex) => itemIndex !== index
                              ),
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                  onAdd={() =>
                    updateResumeData({
                      ...form.resumeData,
                      projects: [
                        ...form.resumeData.projects,
                        {
                          name: "",
                          role: "",
                          technologies: [""],
                          descriptions: [""],
                        },
                      ],
                    })
                  }
                />

                <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-end">
                  {!isCreating && selectedProfileId !== null && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting || isSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-5 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {t("actions.delete")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || isDeleting || isLoadingDetail}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {t("actions.save")}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title={t("deleteDialog.title")}
        description={t("deleteDialog.description")}
        cancelLabel={t("deleteDialog.cancel")}
        confirmLabel={t("deleteDialog.confirm")}
        isConfirming={isDeleting}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />
    </main>
  );
};

interface FieldProps {
  label: string;
  value: string;
  type?: "text" | "number";
  onChange: (value: string) => void;
}

const Field = ({ label, value, type = "text", onChange }: FieldProps) => (
  <label className="block">
    <span className="text-xs font-medium text-zinc-700">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-1 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
    />
  </label>
);

interface SelectFieldProps {
  label: string;
  value: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

const SelectField = ({
  label,
  value,
  placeholder,
  options,
  onChange,
}: SelectFieldProps) => (
  <label className="block">
    <span className="text-xs font-medium text-zinc-700">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-1 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

interface TextareaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const TextareaField = ({ label, value, onChange }: TextareaFieldProps) => (
  <label className="block">
    <span className="text-xs font-medium text-zinc-700">{label}</span>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={4}
      className="mt-1 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
    />
  </label>
);

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  actionLabel: string;
  onAdd: () => void;
}

const SectionHeader = ({
  icon,
  title,
  actionLabel,
  onAdd,
}: SectionHeaderProps) => (
  <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
    <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
      {icon ? <span className="text-zinc-500">{icon}</span> : null}
      {title}
    </h3>
    <button
      type="button"
      onClick={onAdd}
      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 transition hover:bg-zinc-50"
    >
      <Plus className="h-3.5 w-3.5 text-zinc-500" />
      {actionLabel}
    </button>
  </div>
);

interface ResumeCollectionEditorProps<T> {
  title: string;
  actionLabel: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onAdd: () => void;
}

const ResumeCollectionEditor = <T,>({
  title,
  actionLabel,
  items,
  renderItem,
  onAdd,
}: ResumeCollectionEditorProps<T>) => (
  <div className="rounded-xl border border-zinc-200">
    <SectionHeader title={title} actionLabel={actionLabel} onAdd={onAdd} />
    <div className="divide-y divide-zinc-200">
      {items.map((item, index) => (
        <div key={index} className="px-4 py-4">
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  </div>
);

interface RemoveButtonProps {
  label: string;
  onClick: () => void;
}

const RemoveButton = ({ label, onClick }: RemoveButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="mt-5 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition hover:bg-rose-50 hover:text-rose-700"
  >
    <Trash2 className="h-4 w-4" />
  </button>
);

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  isConfirming: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmDialog = ({
  isOpen,
  title,
  description,
  cancelLabel,
  confirmLabel,
  isConfirming,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/35 px-4"
    >
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_24px_70px_rgba(24,24,27,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            aria-label={cancelLabel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isConfirming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagePage;
