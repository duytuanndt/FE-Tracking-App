import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGithubRepos, githubApiKeys } from '@/apis/githubApi';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const DEFAULT_OWNER = 'Foxcode-Studio-Server';

export function GithubRepositoriesPage() {
  const [ownerInput, setOwnerInput] = useState(DEFAULT_OWNER);
  const [appliedOwner, setAppliedOwner] = useState(DEFAULT_OWNER);

  const repositoriesQuery = useQuery({
    queryKey: githubApiKeys.repos(appliedOwner),
    queryFn: () => fetchGithubRepos(appliedOwner),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">GitHub Repositories</h1>
        <p className="text-muted-foreground text-sm">
          Browse repositories for a GitHub owner.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="github-repositories-owner">Owner</Label>
              <Input
                id="github-repositories-owner"
                value={ownerInput}
                onChange={(event) => setOwnerInput(event.target.value)}
                placeholder={DEFAULT_OWNER}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => setAppliedOwner(ownerInput.trim() || DEFAULT_OWNER)}>
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {repositoriesQuery.isLoading && (
        <Card>
          <CardContent className="space-y-2 pt-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      )}

      {repositoriesQuery.isError && (
        <Alert variant="destructive">
          <AlertTitle>Could not load repositories</AlertTitle>
          <AlertDescription>{(repositoriesQuery.error as Error).message}</AlertDescription>
        </Alert>
      )}

      {!repositoriesQuery.isLoading && !repositoriesQuery.isError && (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableCaption>Repositories for owner: {appliedOwner}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead className="text-right">Visibility</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repositoriesQuery.data?.map((repo) => (
                  <TableRow key={repo.fullName}>
                    <TableCell>{repo.name}</TableCell>
                    <TableCell>{repo.fullName}</TableCell>
                    <TableCell className="text-right">
                      {repo.private ? 'Private' : 'Public'}
                    </TableCell>
                  </TableRow>
                ))}
                {(repositoriesQuery.data?.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground text-center">
                      No repositories found for this owner.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
