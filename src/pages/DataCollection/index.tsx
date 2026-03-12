import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDogGames } from '@/apis/dogGames';
import { DogGamesTable } from './DogGamesTable';
import { TablePagination } from '../Android/components/TablePagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type StatusTab = 'all' | 'published' | 'draft' | 'archived';

const ITEMS_PER_PAGE = 10;

export function DataCollectionPage() {
  const navigate = useNavigate();
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, error, refetch, isFetching } = useDogGames({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    keyword: debouncedSearch || undefined,
    status: statusTab === 'all' ? 'all' : statusTab,
  });

  const total = data?.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / ITEMS_PER_PAGE) : 1;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Collection</h1>
          <p className="text-sm text-muted-foreground">
            Manage dog games and activities shown in the mobile app.
          </p>
        </div>
        <Button asChild>
          <Link to="/dog-games/new">Add New Game</Link>
        </Button>
      </div>

      <Tabs
        value={statusTab}
        onValueChange={(value) => {
          setStatusTab(value as StatusTab);
          setCurrentPage(1);
        }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="published">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          <div className="flex w-full gap-2 md:w-auto">
            <Input
              placeholder="Search games…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-[260px]"
            />
          </div>
        </div>
      </Tabs>

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load dog games</AlertTitle>
          <AlertDescription>
            {(error as Error)?.message ?? 'Something went wrong. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      <DogGamesTable
        isLoading={isLoading || isFetching}
        games={data?.items ?? []}
        onRefresh={refetch}
        onEdit={(id) => navigate(`/dog-games/${id}/edit`)}
      />

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <div className="text-xs text-muted-foreground">
        Showing {data?.items.length ?? 0} of {total} games
      </div>
    </div>
  );
}

