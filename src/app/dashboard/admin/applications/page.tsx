'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  fetchMentorApplications,
  reviewMentorApplication,
  type MentorApplication,
} from '@/lib/api/users';
import { toastError, toastSuccess } from '@/lib/toast';

function GitHubSummary({ data }: { data?: MentorApplication['github_data'] }) {
  const summary = data?.summary;
  const profile = data?.profile;
  const prs = data?.pull_requests;

  if (!summary && !profile) {
    return <p className="muted">No GitHub contribution data fetched yet.</p>;
  }

  return (
    <div className="github-summary">
      <ul className="stats">
        {summary?.public_repos != null && <li>Public repos: <strong>{summary.public_repos}</strong></li>}
        {summary?.followers != null && <li>Followers: <strong>{summary.followers}</strong></li>}
        {(summary?.total_prs ?? prs?.total_count) != null && (
          <li>Pull requests: <strong>{summary?.total_prs ?? prs?.total_count}</strong></li>
        )}
        {summary?.recent_repos && summary.recent_repos.length > 0 && (
          <li>Recent repos: {summary.recent_repos.join(', ')}</li>
        )}
      </ul>
      {prs?.items && prs.items.length > 0 && (
        <details>
          <summary>Recent PRs</summary>
          <ul className="stats">
            {prs.items.slice(0, 5).map((pr) => (
              <li key={pr.html_url}>
                <a href={pr.html_url} target="_blank" rel="noopener noreferrer">{pr.title}</a>
                <span className="muted"> ({pr.state})</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function applicantGithub(app: MentorApplication): string | undefined {
  return (
    app.applicant_github_username ||
    app.github_data?.profile?.login ||
    app.github_data?.summary?.login
  );
}

function applicantGithubUrl(app: MentorApplication): string | undefined {
  const login = applicantGithub(app);
  if (!login) return undefined;
  return app.github_data?.profile?.html_url || `https://github.com/${login}`;
}

export default function AdminApplicationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [apps, setApps] = useState<MentorApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorApplications('pending')
      .then(setApps)
      .catch((err) => toastError(err, 'Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);

  async function review(id: string, status: 'approved' | 'rejected') {
    try {
      await reviewMentorApplication(id, status);
      setApps((prev) => prev.filter((a) => a.id !== id));
      toastSuccess(status === 'approved' ? 'Mentor approved' : 'Application rejected');
    } catch (err) {
      toastError(err, 'Review failed');
    }
  }

  if (authLoading) return <p className="muted">Loading...</p>;
  if (user?.role !== 'admin') {
    return <p className="access-denied">Admin access required.</p>;
  }

  return (
    <>
      <h1>Mentor Applications</h1>
      <p className="muted">Review GitHub contribution history before approving mentors.</p>
      {loading && <p className="muted">Loading applications...</p>}
      {!loading && apps.length === 0 ? (
        <p className="muted">No pending applications.</p>
      ) : (
        apps.map((app) => {
          const github = applicantGithub(app);
          const githubUrl = applicantGithubUrl(app);
          const displayName = app.applicant_display_name || github || 'Unknown applicant';

          return (
            <div key={app.id} className="card application-card">
              <div className="application-applicant">
                <h3>{displayName}</h3>
                {app.applicant_email && (
                  <p>
                    <span className="muted">Email:</span>{' '}
                    <a href={`mailto:${app.applicant_email}`}>{app.applicant_email}</a>
                  </p>
                )}
                {github && githubUrl && (
                  <p>
                    <span className="muted">GitHub:</span>{' '}
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                      @{github}
                    </a>
                  </p>
                )}
                {app.created_at && (
                  <p className="muted application-date">
                    Applied {new Date(app.created_at).toLocaleString()}
                  </p>
                )}
              </div>
              <GitHubSummary data={app.github_data} />
              <div className="actions">
                <button type="button" className="btn" onClick={() => review(app.id, 'approved')}>
                  Approve
                </button>
                <button type="button" className="btn btn-error-outline" onClick={() => review(app.id, 'rejected')}>
                  Reject
                </button>
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
