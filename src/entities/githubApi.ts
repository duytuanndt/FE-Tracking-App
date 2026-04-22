export type GithubApiFilters = {
  from: string;
  to: string;
  owner?: string;
  dev?: string;
  repo?: string;
  repos?: string;
  perPage?: number;
};

export type GithubApiRepoItem = {
  name: string;
  fullName: string;
  private: boolean;
};

export type GithubApiMember = {
  id?: number;
  login: string;
  avatarUrl?: string;
  htmlUrl?: string;
  type?: string;
};

export type GithubApiCommitRow = {
  developer: string;
  repo: string;
  commits: number;
};

export type GithubApiLineRow = {
  developer: string;
  repo: string;
  additions: number;
  deletions: number;
  net: number;
};

export type GithubApiRepoAggregate = {
  repo: string;
  commits: number;
  additions: number;
  deletions: number;
  net: number;
};

export type GithubApiSummaryResponse = {
  developer: string;
  from: string;
  to: string;
  repos: GithubApiRepoAggregate[];
  summary: GithubApiRepoAggregate;
};
