import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGithubMembers, githubApiKeys } from '@/apis/githubApi';
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

export function GithubMembersPage() {
  const [ownerInput, setOwnerInput] = useState(DEFAULT_OWNER);
  const [appliedOwner, setAppliedOwner] = useState(DEFAULT_OWNER);

  const membersQuery = useQuery({
    queryKey: githubApiKeys.members(appliedOwner),
    queryFn: () => fetchGithubMembers(appliedOwner),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">GitHub Members</h1>
        <p className="text-muted-foreground text-sm">
          List organization members for the selected owner.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="github-members-owner">Owner</Label>
              <Input
                id="github-members-owner"
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

      {membersQuery.isLoading && (
        <Card>
          <CardContent className="space-y-2 pt-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      )}

      {membersQuery.isError && (
        <Alert variant="destructive">
          <AlertTitle>Could not load members</AlertTitle>
          <AlertDescription>{(membersQuery.error as Error).message}</AlertDescription>
        </Alert>
      )}

      {!membersQuery.isLoading && !membersQuery.isError && (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableCaption>Members for owner: {appliedOwner}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Profile</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membersQuery.data?.map((member) => (
                  <TableRow key={`${member.login}-${member.id ?? 'no-id'}`}>
                    <TableCell>
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={`${member.login} avatar`}
                          className="h-8 w-8 rounded-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{member.login}</TableCell>
                    <TableCell>{member.type ?? '-'}</TableCell>
                    <TableCell className="text-right">
                      {member.htmlUrl ? (
                        <a
                          href={member.htmlUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline-offset-2 hover:underline"
                        >
                          Open
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(membersQuery.data?.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground text-center">
                      No members found for this owner.
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
