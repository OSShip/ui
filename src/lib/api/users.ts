import { api } from './client';

export interface Enrollment {
  id: string;
  listing_id: string;
  status: string;
}

export interface MentorApplication {
  id: string;
  user_id: string;
  status: string;
  github_data?: {
    summary?: {
      login?: string;
      public_repos?: number;
      followers?: number;
      total_prs?: number;
      recent_repos?: string[];
    };
    profile?: { login?: string; html_url?: string; bio?: string };
    pull_requests?: {
      total_count?: number;
      items?: Array<{ title?: string; html_url?: string; state?: string }>;
    };
  };
  created_at?: string;
}

export interface UserProfile {
  display_name?: string;
  bio?: string;
  github_username?: string;
  role: string;
}

export async function fetchEnrollments(userId: string): Promise<Enrollment[]> {
  return api<Enrollment[]>(`/users/${userId}/enrollments`);
}

export async function linkContribution(prUrl: string) {
  return api('/users/me/contributions', {
    method: 'POST',
    body: JSON.stringify({ pr_url: prUrl }),
  });
}

export async function fetchProfile(userId: string): Promise<UserProfile> {
  return api<UserProfile>(`/users/${userId}/profile`);
}

export async function applyMentor(githubUsername?: string) {
  return api<MentorApplication>('/mentors/apply', {
    method: 'POST',
    body: JSON.stringify({ github_username: githubUsername }),
  });
}

export async function fetchMentorApplications(status = 'pending') {
  return api<MentorApplication[]>(`/mentors/admin/applications?status=${status}`);
}

export async function reviewMentorApplication(id: string, status: 'approved' | 'rejected') {
  return api(`/mentors/admin/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
