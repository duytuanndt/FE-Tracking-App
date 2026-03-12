import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  useTrainingLesson,
  useUpdateTrainingLessonImages,
} from '@/apis/dogTrainingLessonsApi';
import { uploadFileToR2 } from '@/apis/r2Upload';
import { Skeleton } from '@/components/ui/skeleton';

function isBlobUrl(url: string | undefined | null): boolean {
  return typeof url === 'string' && url.startsWith('blob:');
}

function sanitizeTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

export function DogTrainingLessonDetailPage() {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();

  const coverImageFileRef = useRef<File | null>(null);
  const stepImageFilesRef = useRef<Map<string, File>>(new Map());

  const {
    data: lesson,
    isLoading,
    isError,
    error,
  } = useTrainingLesson(lessonId);

  const {
    mutateAsync: updateImages,
    isPending: isUpdatingImages,
  } = useUpdateTrainingLessonImages(lessonId ?? '');

  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>();
  const [stepImageUrls, setStepImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (lesson) {
      setCoverImageUrl(lesson.imageUrl);
      const initial: Record<string, string> = {};
      lesson.steps.forEach((step, index) => {
        // console.log('step', step);
        const key = step.stepId ?? String(index);
        if (step.imageUrl) {
          initial[key] = step.imageUrl;
        }
      });
      setStepImageUrls(initial);
      coverImageFileRef.current = null;
      stepImageFilesRef.current.clear();
    }
  }, [lesson]);

  const isSaving = isUpdatingImages;

  const stepKeyOrder = useMemo(() => {
    if (!lesson) return [];
    return lesson.steps.map((step, index) => step.stepId ?? String(index));
  }, [lesson]);

  const handleBack = () => {
    navigate('/dog-lessons');
  };

  const handleSaveImages = async () => {
    if (!lesson || !lessonId) return;

    try {
      // Generate prefix from sanitized lesson title
      const sanitizedTitle = sanitizeTitle(lesson.title);
      const prefix = `training/lesson/${sanitizedTitle}`;

      let finalCoverUrl = coverImageUrl ?? lesson.imageUrl ?? '';

      if (coverImageFileRef.current && isBlobUrl(coverImageUrl)) {
        const uploadedCoverUrl = await uploadFileToR2(
          lesson.id,
          coverImageFileRef.current,
          prefix,
        );
        if (coverImageUrl) {
          URL.revokeObjectURL(coverImageUrl);
        }
        finalCoverUrl = uploadedCoverUrl;
      }

      const finalStepEntries: { stepId: string; imageUrl: string }[] = [];

      for (let index = 0; index < lesson.steps.length; index++) {
        const step = lesson.steps[index];
        if (!step.stepId) continue;

        const key = step.stepId ?? String(index);
        const currentUrl = stepImageUrls[key] ?? step.imageUrl ?? '';
        const file = stepImageFilesRef.current.get(key) ?? null;

        let finalUrl = currentUrl;

        if (file && isBlobUrl(currentUrl)) {
          // Use step order or index + 1 for step sequence name
          const stepOrder = step.order ?? index + 1;
          const stepName = `step-${String(stepOrder).padStart(2, '0')}`;

          const uploadedUrl = await uploadFileToR2(
            step.stepId,
            file,
            prefix,
            stepName,
          );
          if (currentUrl) {
            URL.revokeObjectURL(currentUrl);
          }
          finalUrl = uploadedUrl;
        }

        if (finalUrl) {
          finalStepEntries.push({
            stepId: step.stepId,
            imageUrl: finalUrl,
          });
        }
      }

      if (!finalCoverUrl && finalStepEntries.length === 0) {
        toast.error('Nothing to update. Please upload at least one image.');
        return;
      }

      await updateImages({
        imageUrl: finalCoverUrl || lesson.imageUrl || '',
        steps: finalStepEntries,
      });

      // console.log("finalCoverUrl", finalCoverUrl);
      // console.log("finalStepEntries", finalStepEntries);

      toast.success('Lesson images updated successfully.');
      navigate('/dog-lessons');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong while saving images';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between">
          <div>
            <Skeleton className="h-6 w-56" />
            <Skeleton className="mt-2 h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !lesson) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lesson not found</h1>
            <p className="text-sm text-muted-foreground">
              {(error as Error)?.message ?? 'We could not load this training lesson.'}
            </p>
          </div>
          <Button variant="ghost" onClick={handleBack}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {lesson.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update the cover and step images for this training lesson.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={handleBack}
            disabled={isSaving}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleSaveImages}
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : 'Save Images'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input value={lesson.title} readOnly disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={lesson.description}
                  readOnly
                  disabled
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lesson.steps.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  This lesson has no steps defined.
                </p>
              ) : (
                stepKeyOrder.map((key, index) => {
                  const step = lesson.steps[index];
                  const currentUrl =
                    stepImageUrls[key] ?? step.imageUrl ?? '';

                  return (
                    <Card key={key}>
                      <CardContent className="space-y-3 pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">
                              Step {step.order || index + 1}: {step.title}
                            </p>
                            {step.contentProTip && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Pro tip: {step.contentProTip}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Description
                          </label>
                          <Textarea
                            value={step.description}
                            readOnly
                            disabled
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Step Image
                          </label>
                          {currentUrl ? (
                            <div className="h-48 w-48 overflow-hidden rounded-md bg-muted border">
                              <img
                                src={currentUrl}
                                alt={`Step ${step.order || index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              No image set for this step.
                            </p>
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;

                              const objectUrl = URL.createObjectURL(file);
                              setStepImageUrls((prev) => ({
                                ...prev,
                                [key]: objectUrl,
                              }));
                              stepImageFilesRef.current.set(key, file);
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                {coverImageUrl ? (
                  <div className="h-40 w-40 overflow-hidden rounded-md bg-muted border">
                    <img
                      src={coverImageUrl}
                      alt="Lesson cover"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-md bg-muted px-4 text-center text-xs text-muted-foreground">
                    No cover image set for this lesson.
                  </div>
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;

                  const objectUrl = URL.createObjectURL(file);
                  setCoverImageUrl(objectUrl);
                  coverImageFileRef.current = file;
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">Lesson ID:</span>{' '}
                <span className="break-all">{lesson.id}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Category Key:</span>{' '}
                {lesson.categoryKey}
              </div>
              <div>
                <span className="font-medium text-foreground">Status:</span>{' '}
                {lesson.status}
              </div>
              <div>
                <span className="font-medium text-foreground">Language:</span>{' '}
                {lesson.language}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

