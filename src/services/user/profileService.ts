import apiClient from "../../utils/axios";

export interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
  timestamp: string;
}

export interface ProfileSkill {
  name: string;
  level: string;
  years: number;
}

export interface ProfileExperience {
  position: string;
  descriptions: string[];
}

export interface ProfileProject {
  name: string;
  role: string;
  technologies: string[];
  descriptions: string[];
}

export interface ResumeData {
  skills: ProfileSkill[];
  experiences: ProfileExperience[];
  projects: ProfileProject[];
}

export interface ProfileSummary {
  id: number;
  title?: string;
  tittle?: string;
}

export interface ProfileDetail extends ProfileSummary {
  targetPosition: string;
  targetLevel: string;
  resumeData: ResumeData;
}

export interface ProfilePayload {
  title: string;
  targetPosition: string;
  targetLevel: string;
  resumeData: ResumeData;
}

const profileService = {
  getProfiles: () => apiClient.get<ApiResponse<ProfileSummary[]>>("/profile"),

  getProfile: (profileId: number) =>
    apiClient.get<ApiResponse<ProfileDetail>>(`/profile/${profileId}`),

  createProfile: (payload: ProfilePayload) =>
    apiClient.post<ApiResponse<ProfileDetail>>("/profile", payload),

  updateProfile: (profileId: number, payload: ProfilePayload) =>
    apiClient.put<ApiResponse<ProfileDetail>>(`/profile/${profileId}`, payload),

  deleteProfile: (profileId: number) =>
    apiClient.delete<ApiResponse<string>>(`/profile/${profileId}`),
};

export const getProfileTitle = (profile: ProfileSummary | ProfileDetail) =>
  profile.title ?? profile.tittle ?? "";

export default profileService;
