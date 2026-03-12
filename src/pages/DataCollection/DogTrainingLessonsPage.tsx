import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useTrainingCategories,
  useTrainingLessonsByCategory,
  type TrainingLesson,
} from '@/apis/dogTrainingLessonsApi';
import { ActionButtons } from '../Android/components/ActionButtons';

export function DogTrainingLessonsPage() {
  const navigate = useNavigate();

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    error: categoriesError,
  } = useTrainingCategories();

  const {
    data: lessons,
    isLoading: isLoadingLessons,
    isError: isLessonsError,
    error: lessonsError,
    refetch: refetchLessons,
    isFetching: isFetchingLessons,
  } = useTrainingLessonsByCategory(selectedCategoryKey);

  // Initialize selected category once categories load
  useEffect(() => {
    if (!selectedCategoryKey && categories && categories.length > 0) {
      setSelectedCategoryKey(categories[0].key);
    }
  }, [categories, selectedCategoryKey]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories?.forEach((c) => {
      map.set(c.key, c.name || c.originalName);
    });
    return map;
  }, [categories]);

  const filteredLessons: TrainingLesson[] = useMemo(() => {
    const all = lessons ?? [];
    if (!debouncedSearch.trim()) return all;
    const q = debouncedSearch.toLowerCase();

    return all.filter((lesson) => {
      return (
        lesson.title.toLowerCase().includes(q) ||
        lesson.description.toLowerCase().includes(q) ||
        lesson.categoryKey.toLowerCase().includes(q)
      );
    });
  }, [lessons, debouncedSearch]);

  const isLoading = isLoadingCategories || isLoadingLessons || isFetchingLessons;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dog Training Lessons</h1>
          <p className="text-sm text-muted-foreground">
            Browse training lessons grouped by category from the Dog Training API.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <div className="w-full md:w-64">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Category
            </label>
            <Select
              value={selectedCategoryKey}
              onValueChange={(value) => setSelectedCategoryKey(value)}
              disabled={isLoadingCategories || !categories || categories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.key}>
                    {category.name} ({category.lessonCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-64">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Search
            </label>
            <Input
              placeholder="Search lessons…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <ActionButtons onRefresh={() => refetchLessons()} />
      </div>

      {(isCategoriesError || isLessonsError) && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load dog training lessons</AlertTitle>
          <AlertDescription>
            {(categoriesError as Error)?.message ||
              (lessonsError as Error)?.message ||
              'Something went wrong. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Title</TableHead>
              <TableHead className="hidden md:table-cell text-center">
                Category
              </TableHead>
              <TableHead className="hidden md:table-cell text-center">
                Status
              </TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-52 mx-auto" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-32 mx-auto" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-8 w-20 mx-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredLessons.length > 0 ? (
              filteredLessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <span className="font-medium">{lesson.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-center">
                    <span className="text-sm">
                      {categoryMap.get(lesson.categoryKey) ?? lesson.categoryKey}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-center text-xs text-muted-foreground">
                    {lesson.status}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link to={`/dog-lessons/${lesson.id}/view`}>View</Link>
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
                  {selectedCategoryKey
                    ? 'No lessons found for this category. Try a different category or search term.'
                    : 'No categories available from the API.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground">
        Showing {filteredLessons.length} lesson
        {filteredLessons.length === 1 ? '' : 's'}
        {selectedCategoryKey ? ` in category "${selectedCategoryKey}"` : ''}
      </div>
    </div>
  );
}

