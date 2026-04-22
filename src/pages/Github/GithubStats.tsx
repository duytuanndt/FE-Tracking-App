import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  fetchGithubCommits,
  fetchGithubLines,
  fetchGithubRepos,
  fetchGithubSummary,
  githubApiKeys,
} from '@/apis/githubApi';
import { GithubApiCommitRow, GithubApiFilters, GithubApiLineRow } from '@/entities/githubApi';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type FormFilters = {
  owner: string;
  from: string;
  to: string;
  dev: string;
  repo: string;
  repos: string[];
};

function toDateTimeInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toIsoOrEmpty(value: string): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString();
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

function formatNet(value: number): string {
  return `${value >= 0 ? '+' : ''}${formatNumber(value)} net`;
}

function formatAppliedRange(from: string, to: string): string {
  const fromLabel = new Date(from).toLocaleString();
  const toLabel = new Date(to).toLocaleString();
  return `${fromLabel} - ${toLabel}`;
}

function buildDeveloperCommitRows(rows: GithubApiCommitRow[]) {
  const repoSet = new Set<string>();
  const developerMap = new Map<string, Record<string, number>>();

  rows.forEach((row) => {
    repoSet.add(row.repo);
    const byRepo = developerMap.get(row.developer) ?? {};
    byRepo[row.repo] = row.commits;
    developerMap.set(row.developer, byRepo);
  });

  const repos = [...repoSet].sort((a, b) => a.localeCompare(b));
  const developers = [...developerMap.entries()].sort(([a], [b]) => a.localeCompare(b));
  return { repos, developers };
}

function buildDeveloperLineRows(rows: GithubApiLineRow[]) {
  const repoSet = new Set<string>();
  const developerMap = new Map<string, Record<string, GithubApiLineRow>>();

  rows.forEach((row) => {
    repoSet.add(row.repo);
    const byRepo = developerMap.get(row.developer) ?? {};
    byRepo[row.repo] = row;
    developerMap.set(row.developer, byRepo);
  });

  const repos = [...repoSet].sort((a, b) => a.localeCompare(b));
  const developers = [...developerMap.entries()].sort(([a], [b]) => a.localeCompare(b));
  return { repos, developers };
}

export function GithubStatsPage() {
  const now = new Date();
  const previousWeek = new Date(now);
  previousWeek.setDate(now.getDate() - 7);

  const [formFilters, setFormFilters] = useState<FormFilters>({
    owner: 'Foxcode-Studio-Server',
    from: toDateTimeInputValue(previousWeek),
    to: toDateTimeInputValue(now),
    dev: '',
    repo: '',
    repos: [],
  });
  const [singleRepoOpen, setSingleRepoOpen] = useState(false);
  const [multiRepoOpen, setMultiRepoOpen] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState<GithubApiFilters>({
    owner: 'Foxcode-Studio-Server',
    from: toIsoOrEmpty(toDateTimeInputValue(previousWeek)),
    to: toIsoOrEmpty(toDateTimeInputValue(now)),
  });

  const hasValidRange = Boolean(appliedFilters.from && appliedFilters.to);

  const ownerForRepoOptions = formFilters.owner || 'Foxcode-Studio-Server';

  const reposQuery = useQuery({
    queryKey: githubApiKeys.repos(ownerForRepoOptions),
    queryFn: () => fetchGithubRepos(ownerForRepoOptions),
    enabled: Boolean(ownerForRepoOptions),
    staleTime: 10 * 60 * 1000,
  });

  const summaryQuery = useQuery({
    queryKey: githubApiKeys.summary(appliedFilters),
    queryFn: () => fetchGithubSummary(appliedFilters),
    enabled: hasValidRange,
    staleTime: 2 * 60 * 1000,
  });

  const commitsQuery = useQuery({
    queryKey: githubApiKeys.commits(appliedFilters),
    queryFn: () => fetchGithubCommits(appliedFilters),
    enabled: hasValidRange,
    staleTime: 2 * 60 * 1000,
  });

  const linesQuery = useQuery({
    queryKey: githubApiKeys.lines(appliedFilters),
    queryFn: () => fetchGithubLines(appliedFilters),
    enabled: hasValidRange,
    staleTime: 2 * 60 * 1000,
  });

  const commitPivot = useMemo(
    () => buildDeveloperCommitRows(commitsQuery.data ?? []),
    [commitsQuery.data],
  );

  const linePivot = useMemo(
    () => buildDeveloperLineRows(linesQuery.data ?? []),
    [linesQuery.data],
  );

  const repoOptions = useMemo(() => reposQuery.data ?? [], [reposQuery.data]);

  const selectedReposText = useMemo(() => {
    if (formFilters.repos.length === 0) {
      return 'Select repositories';
    }
    if (formFilters.repos.length <= 2) {
      return formFilters.repos.join(', ');
    }
    return `${formFilters.repos.slice(0, 2).join(', ')} +${formFilters.repos.length - 2}`;
  }, [formFilters.repos]);

  const toggleMultiRepo = (repoName: string) => {
    setFormFilters((prev) => {
      const exists = prev.repos.includes(repoName);
      return {
        ...prev,
        repo: '',
        repos: exists ? prev.repos.filter((name) => name !== repoName) : [...prev.repos, repoName],
      };
    });
  };

  const onApplyFilters = () => {
    const normalizedSingleRepo = formFilters.repo || undefined;
    const normalizedMultiRepos =
      normalizedSingleRepo || formFilters.repos.length === 0
        ? undefined
        : formFilters.repos.join(',');

    const nextFilters: GithubApiFilters = {
      from: toIsoOrEmpty(formFilters.from),
      to: toIsoOrEmpty(formFilters.to),
      owner: formFilters.owner || undefined,
      dev: formFilters.dev || undefined,
      repo: normalizedSingleRepo,
      repos: normalizedMultiRepos,
    };

    if (!nextFilters.from || !nextFilters.to) {
      return;
    }

    setAppliedFilters(nextFilters);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">GitHub Team Stats</h1>
        <p className="text-muted-foreground text-sm">
          GitHub metrics are proxy signals and should be interpreted with context.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="github-owner">Owner</Label>
              <Input
                id="github-owner"
                value={formFilters.owner}
                onChange={(event) =>
                  setFormFilters((prev) => ({ ...prev, owner: event.target.value }))
                }
                placeholder="Foxcode-Studio-Server"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github-from">From</Label>
              <Input
                id="github-from"
                type="datetime-local"
                value={formFilters.from}
                onChange={(event) =>
                  setFormFilters((prev) => ({ ...prev, from: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github-to">To</Label>
              <Input
                id="github-to"
                type="datetime-local"
                value={formFilters.to}
                onChange={(event) =>
                  setFormFilters((prev) => ({ ...prev, to: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github-dev">Developer (optional)</Label>
              <Input
                id="github-dev"
                value={formFilters.dev}
                onChange={(event) =>
                  setFormFilters((prev) => ({ ...prev, dev: event.target.value }))
                }
                placeholder="octocat"
              />
            </div>
            <div className="space-y-2">
              <Label>Repo (single)</Label>
              <Popover open={singleRepoOpen} onOpenChange={setSingleRepoOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {formFilters.repo || 'Select a repository'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandInput placeholder="Search repository..." />
                    <CommandList>
                      <CommandEmpty>No repository found.</CommandEmpty>
                      <CommandGroup>
                        {repoOptions.map((repo) => (
                          <CommandItem
                            key={repo.fullName}
                            value={repo.name}
                            onSelect={() => {
                              setFormFilters((prev) => ({
                                ...prev,
                                repo: repo.name,
                                repos: [],
                              }));
                              setSingleRepoOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formFilters.repo === repo.name ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            {repo.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Repos (multiple)</Label>
              <Popover open={multiRepoOpen} onOpenChange={setMultiRepoOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {selectedReposText}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandInput placeholder="Search repositories..." />
                    <CommandList>
                      <CommandEmpty>No repository found.</CommandEmpty>
                      <CommandGroup>
                        {repoOptions.map((repo) => {
                          const selected = formFilters.repos.includes(repo.name);
                          return (
                            <CommandItem
                              key={repo.fullName}
                              value={repo.name}
                              onSelect={() => toggleMultiRepo(repo.name)}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selected ? 'opacity-100' : 'opacity-0',
                                )}
                              />
                              {repo.name}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {reposQuery.isError && (
            <p className="text-destructive text-sm">
              Failed to load repositories for selectors: {(reposQuery.error as Error).message}
            </p>
          )}
          <div className="flex items-center gap-3">
            <Button onClick={onApplyFilters} className="cursor-pointer">
              Apply
            </Button>
            <span className="text-muted-foreground text-sm">
              Active range:{' '}
              {hasValidRange
                ? formatAppliedRange(appliedFilters.from, appliedFilters.to)
                : 'Invalid date range'}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryQuery.isLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Commits</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {formatNumber(summaryQuery.data?.summary.commits ?? 0)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Additions</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {formatNumber(summaryQuery.data?.summary.additions ?? 0)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Deletions</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {formatNumber(summaryQuery.data?.summary.deletions ?? 0)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Net</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {formatNet(summaryQuery.data?.summary.net ?? 0)}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {(summaryQuery.isError || commitsQuery.isError || linesQuery.isError) && (
        <Alert variant="destructive">
          <AlertTitle>One or more metrics failed to load</AlertTitle>
          <AlertDescription>
            {(summaryQuery.error as Error)?.message ||
              (commitsQuery.error as Error)?.message ||
              (linesQuery.error as Error)?.message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="commits">By developer (commits)</TabsTrigger>
          <TabsTrigger value="lines">By developer (lines)</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableCaption>
                  Summary by repository for {formatAppliedRange(appliedFilters.from, appliedFilters.to)}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Repository</TableHead>
                    <TableHead className="text-right">Commits</TableHead>
                    <TableHead className="text-right">Additions</TableHead>
                    <TableHead className="text-right">Deletions</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(summaryQuery.data?.repos ?? []).map((row) => (
                    <TableRow key={row.repo}>
                      <TableCell>{row.repo}</TableCell>
                      <TableCell className="text-right">{formatNumber(row.commits)}</TableCell>
                      <TableCell className="text-right">{formatNumber(row.additions)}</TableCell>
                      <TableCell className="text-right">{formatNumber(row.deletions)}</TableCell>
                      <TableCell className="text-right">{formatNet(row.net)}</TableCell>
                    </TableRow>
                  ))}
                  {!summaryQuery.isLoading && (summaryQuery.data?.repos.length ?? 0) === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground text-center">
                        No commits found in this range.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commits">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableCaption>
                  Commit counts by developer and repository for{' '}
                  {formatAppliedRange(appliedFilters.from, appliedFilters.to)}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Developer</TableHead>
                    {commitPivot.repos.map((repo) => (
                      <TableHead key={repo} className="text-right">
                        {repo}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commitPivot.developers.map(([developer, values]) => (
                    <TableRow key={developer}>
                      <TableCell>{developer}</TableCell>
                      {commitPivot.repos.map((repo) => (
                        <TableCell key={`${developer}-${repo}`} className="text-right">
                          {formatNumber(values[repo] ?? 0)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {!commitsQuery.isLoading && commitPivot.developers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={Math.max(commitPivot.repos.length + 1, 2)} className="text-muted-foreground text-center">
                        No developer commit rows found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lines">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableCaption>
                  Line changes by developer and repository for{' '}
                  {formatAppliedRange(appliedFilters.from, appliedFilters.to)}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Developer</TableHead>
                    {linePivot.repos.map((repo) => (
                      <TableHead key={repo} className="text-right">
                        {repo}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linePivot.developers.map(([developer, values]) => (
                    <TableRow key={developer}>
                      <TableCell>{developer}</TableCell>
                      {linePivot.repos.map((repo) => {
                        const metric = values[repo];
                        const net = metric ? formatNet(metric.net) : '+0 net';
                        return (
                          <TableCell key={`${developer}-${repo}`} className="text-right">
                            {metric
                              ? `${formatNumber(metric.additions)}/${formatNumber(metric.deletions)} (${net})`
                              : '-'}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                  {!linesQuery.isLoading && linePivot.developers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={Math.max(linePivot.repos.length + 1, 2)} className="text-muted-foreground text-center">
                        No developer line rows found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
