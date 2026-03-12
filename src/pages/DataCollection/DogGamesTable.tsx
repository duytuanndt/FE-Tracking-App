import { format } from 'date-fns';
import { Link } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { DogGame } from '@/apis/dogGames';
import { ActionButtons } from '../Android/components/ActionButtons';
import { Skeleton } from '@/components/ui/skeleton';

interface DogGamesTableProps {
  isLoading: boolean;
  games: DogGame[];
  onEdit: (id: string) => void;
  onRefresh: () => void;
}

export function DogGamesTable({
  isLoading,
  games,
  onEdit,
  onRefresh,
}: DogGamesTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Manage the dog games shown in the mobile app list.
        </p>
        <ActionButtons onRefresh={onRefresh} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="text-center">Category Name</TableHead>
              <TableHead className="hidden md:table-cell text-center">
                Updated At
              </TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-[260px]" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-8 w-20 mx-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : games.length > 0 ? (
              games.map((game) => (
                <TableRow key={game.id}>
                  <TableCell className="text-center">
                    <div className="flex items-center gap-3 justify-center">
                      <div className="flex flex-col gap-1 text-center">
                        <span className="font-medium">{game.name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">{game.categoryName}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-center text-xs text-muted-foreground">
                    {format(new Date(game.updatedAt), 'dd MMM yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link to={`/dog-games/${game.id}/view`}>View</Link>
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onEdit(game.id)}
                      >
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No games found. Try adjusting your filters or add a new game.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

