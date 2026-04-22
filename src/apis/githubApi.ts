import {
  GithubApiCommitRow,
  GithubApiFilters,
  GithubApiLineRow,
  GithubApiMember,
  GithubApiRepoItem,
  GithubApiSummaryResponse,
} from '@/entities/githubApi';

const DEFAULT_API_BASE_URL = 'https://platform-internal.foxcode.info/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
const INTERNAL_TOKEN = import.meta.env.VITE_GITHUB_INTERNAL_TOKEN;

const baseModuleUrl = `${API_BASE_URL}/v1/github-api`;

export const githubApiKeys = {
  all: ['github-api'] as const,
  repos: (owner?: string) =>
    [...githubApiKeys.all, 'repos', { owner }] as const,
  members: (owner?: string) =>
    [...githubApiKeys.all, 'members', { owner }] as const,
  commits: (filters: GithubApiFilters) =>
    [...githubApiKeys.all, 'commits', filters] as const,
  lines: (filters: GithubApiFilters) =>
    [...githubApiKeys.all, 'lines', filters] as const,
  summary: (filters: GithubApiFilters) =>
    [...githubApiKeys.all, 'summary', filters] as const,
};

function toSearchParams(filters: GithubApiFilters): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      return;
    }
    params.set(key, String(value));
  });

  return params;
}

async function fetchJson<T>(
  path: string,
  params?: URLSearchParams,
): Promise<T> {
  const query = params ? `?${params.toString()}` : '';
  const url = `${baseModuleUrl}${path}${query}`;
  const headers: HeadersInit = INTERNAL_TOKEN
    ? { 'x-internal-token': INTERNAL_TOKEN }
    : {};
  const response = await fetch(url, { method: 'GET', headers });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }

  return response.json() as Promise<T>;
}

export function fetchGithubRepos(owner?: string): Promise<GithubApiRepoItem[]> {
  const params = owner ? new URLSearchParams({ owner }) : undefined;
  return fetchJson<GithubApiRepoItem[]>('/repos', params);
}

export function fetchGithubCommits(
  filters: GithubApiFilters,
): Promise<GithubApiCommitRow[]> {
  return fetchJson<GithubApiCommitRow[]>('/commits', toSearchParams(filters));
}

function mapMember(member: Record<string, unknown>): GithubApiMember {
  return {
    id: typeof member.id === 'number' ? member.id : undefined,
    login: typeof member.login === 'string' ? member.login : 'unknown',
    avatarUrl:
      typeof member.avatarUrl === 'string'
        ? member.avatarUrl
        : typeof member.avatar_url === 'string'
          ? member.avatar_url
          : undefined,
    htmlUrl:
      typeof member.htmlUrl === 'string'
        ? member.htmlUrl
        : typeof member.html_url === 'string'
          ? member.html_url
          : undefined,
    type: typeof member.type === 'string' ? member.type : undefined,
  };
}

export async function fetchGithubMembers(
  owner?: string,
): Promise<GithubApiMember[]> {
  const params = owner ? new URLSearchParams({ owner }) : undefined;
  const response = await fetchJson<unknown[]>('/members', params);

  if (!Array.isArray(response)) {
    return [];
  }

  return response.map((item) =>
    mapMember((item ?? {}) as Record<string, unknown>),
  );
}

export function fetchGithubLines(
  filters: GithubApiFilters,
): Promise<GithubApiLineRow[]> {
  return fetchJson<GithubApiLineRow[]>('/lines', toSearchParams(filters));
}

export function fetchGithubSummary(
  filters: GithubApiFilters,
): Promise<GithubApiSummaryResponse> {
  return fetchJson<GithubApiSummaryResponse>(
    '/summary',
    toSearchParams(filters),
  );
}
