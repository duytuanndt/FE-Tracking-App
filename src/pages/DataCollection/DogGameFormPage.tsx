import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useCreateDogGame,
  useDogGame,
  useUpdateDogGame,
  updateDogGame,
  updateDogGameImages,
} from '@/apis/dogGames';
import { uploadFileToR2 } from '@/apis/r2Upload';

type DogGameFormMode = 'create' | 'edit' | 'view';

interface DogGameFormPageProps {
  mode: DogGameFormMode;
}

const dogGameSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
  shortDescription: z
    .string()
    .min(1, 'Short description is required')
    .max(180, 'Max 180 characters'),
  image: z
    .string()
    .min(1, 'Cover image is required'),
  categoryName: z.string().min(1, 'Category is required'),
  difficulty: z.string().optional(),
  ageGroup: z.string().optional(),
  durationMinutes: z
    .number({ invalid_type_error: 'Duration must be a number' })
    .min(0, 'Duration must be >= 0')
    .nullable()
    .optional(),
  displayOrder: z
    .number({ invalid_type_error: 'Display order must be a number' })
    .min(0, 'Display order must be >= 0'),
  status: z.enum(['draft', 'published', 'archived']),
  visibleInApp: z.boolean(),
  steps: z
    .array(
      z.object({
        stepNo: z.number(),
        title: z.string().min(1, 'Step title is required'),
        description: z.string().min(1, 'Step description is required'),
        imageUrl: z.string().optional(),
        // Optional backend identifier for this step (imageStepOrder/_id)
        stepId: z.string().optional(),
      }),
    )
    .min(1, 'Add at least one step'),
  tips: z.string().optional(),
  safetyNotes: z.string().optional(),
});

type DogGameFormValues = z.infer<typeof dogGameSchema>;

// Helper function to check if a URL is a blob URL (new file)
function isBlobUrl(url: string): boolean {
  return url.startsWith('blob:');
}

export function DogGameFormPage({ mode }: DogGameFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = mode === 'edit';
  const isView = mode === 'view';
  const queryClient = useQueryClient();

  const [submitIntent, setSubmitIntent] = useState<'draft' | 'publish'>('draft');
  const [isUploading, setIsUploading] = useState(false);

  // Track file objects separately from URLs
  const coverImageFileRef = useRef<File | null>(null);
  const stepImageFilesRef = useRef<Map<number, File>>(new Map());

  const {
    data: existingGame,
    isLoading: isLoadingGame,
  } = useDogGame((isEdit || isView) ? id : undefined);

  const form = useForm<DogGameFormValues>({
    resolver: zodResolver(dogGameSchema),
    defaultValues: {
      name: '',
      shortDescription: '',
      image: '',
      categoryName: '',
      difficulty: '',
      ageGroup: '',
      durationMinutes: undefined,
      displayOrder: 0,
      status: 'draft',
      visibleInApp: true,
      steps: [
        {
          stepNo: 1,
          title: '',
          description: '',
          stepId: undefined,
        },
      ],
      tips: '',
      safetyNotes: '',
    },
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control: form.control,
    name: 'steps',
  });

  const { mutateAsync: createDogGame, isPending: isCreating } =
    useCreateDogGame();
  const { mutateAsync: updateDogGameMutation, isPending: isUpdating } =
    useUpdateDogGame(id ?? '');

  useEffect(() => {
    if (existingGame) {
      // Clear file refs when loading existing game
      coverImageFileRef.current = null;
      stepImageFilesRef.current.clear();

      form.reset({
        name: existingGame.name,
        shortDescription: existingGame.shortDescription,
        image: existingGame.image,
        categoryName: existingGame.categoryName,
        difficulty: existingGame.difficulty ?? '',
        ageGroup: existingGame.ageGroup ?? '',
        durationMinutes: existingGame.durationMinutes,
        displayOrder: existingGame.displayOrder,
        status: existingGame.status,
        visibleInApp: existingGame.visibleInApp,
        steps:
          existingGame.steps.length > 0
            ? existingGame.steps.map((step, index) => ({
              stepNo: step.stepNo ?? index + 1,
              title: step.title,
              description: step.description,
              imageUrl: step.imageUrl,
              stepId: step.stepId,
            }))
            : [
              {
                stepNo: 1,
                title: '',
                description: '',
                stepId: undefined,
              },
            ],
        tips: existingGame.tips ?? '',
        safetyNotes: existingGame.safetyNotes ?? '',
      });
    }
  }, [existingGame, form]);

  const isSubmitting = isCreating || isUpdating || isUploading;

  const pageTitle = useMemo(
    () => {
      if (isView) return 'View Dog Game';
      if (isEdit) return 'Edit Dog Game';
      return 'Add New Dog Game';
    },
    [isEdit, isView],
  );

  const onSubmit = async (values: DogGameFormValues) => {
    const nextStatus = submitIntent === 'publish' ? 'published' : values.status;

    setIsUploading(true);

    try {
      let gameId = id;
      let finalImageUrl = values.image;
      const finalStepImageUrls: (string | undefined)[] = [];

      // Helper function to upload a single image
      const uploadImage = async (
        file: File | null,
        currentUrl: string,
        productId: string,
      ): Promise<string> => {
        if (file && isBlobUrl(currentUrl)) {
          // Upload new file
          const uploadedUrl = await uploadFileToR2(productId, file);
          // Clean up blob URL
          URL.revokeObjectURL(currentUrl);
          return uploadedUrl;
        }
        // Return existing URL
        return currentUrl;
      };

      // For create mode: create game first to get ID
      if (!isEdit) {
        // Use existing URL if no new file, otherwise placeholder
        const initialImageUrl = coverImageFileRef.current
          ? 'placeholder'
          : values.image;

        const initialPayload = {
          name: values.name,
          shortDescription: values.shortDescription,
          image: initialImageUrl, // Will be updated after upload if needed
          categoryName: values.categoryName,
          difficulty: values.difficulty || undefined,
          ageGroup: values.ageGroup || undefined,
          durationMinutes: values.durationMinutes ?? undefined,
          displayOrder: values.displayOrder,
          status: nextStatus,
          visibleInApp: values.visibleInApp,
          steps: values.steps.map((step, index) => ({
            stepNo: index + 1,
            title: step.title,
            description: step.description,
            imageUrl: stepImageFilesRef.current.get(index)
              ? undefined
              : step.imageUrl || undefined,
          })),
          tips: values.tips || undefined,
          safetyNotes: values.safetyNotes || undefined,
        };

        const createdGame = await createDogGame(initialPayload);
        gameId = createdGame.id;
      }

      if (!gameId) {
        throw new Error('Game ID is required for image upload');
      }

      // Upload cover image if it's a new file
      finalImageUrl = await uploadImage(
        coverImageFileRef.current,
        values.image,
        gameId,
      );

      // Upload step images if they are new files
      for (let i = 0; i < values.steps.length; i++) {
        const step = values.steps[i];
        const stepFile = stepImageFilesRef.current.get(i);
        const stepImageUrl = step.imageUrl || '';

        if (stepFile && isBlobUrl(stepImageUrl)) {
          const uploadedUrl = await uploadImage(
            stepFile,
            stepImageUrl,
            gameId,
          );
          finalStepImageUrls.push(uploadedUrl);
        } else {
          finalStepImageUrls.push(stepImageUrl || undefined);
        }
      }

      // Prepare final payload with uploaded URLs
      const payload = {
        name: values.name,
        shortDescription: values.shortDescription,
        image: finalImageUrl,
        categoryName: values.categoryName,
        difficulty: values.difficulty || undefined,
        ageGroup: values.ageGroup || undefined,
        durationMinutes: values.durationMinutes ?? undefined,
        displayOrder: values.displayOrder,
        status: nextStatus,
        visibleInApp: values.visibleInApp,
        steps: values.steps.map((step, index) => ({
          stepNo: index + 1,
          title: step.title,
          description: step.description,
          imageUrl: finalStepImageUrls[index],
        })),
        tips: values.tips || undefined,
        safetyNotes: values.safetyNotes || undefined,
      };

      // Update game with final URLs
      const isRemoteGame = existingGame?.source === 'remote';

      if (isEdit && gameId) {
        if (isRemoteGame) {
          // For remote exercises, only sync images via PATCH images endpoint
          const stepsForPatch = values.steps
            .map((step, index) => {
              const stepId = step.stepId;
              const image = finalStepImageUrls[index];
              return stepId && image
                ? {
                  _id: stepId,
                  image,
                }
                : null;
            })
            .filter(
              (s): s is { _id: string; image: string } => s !== null,
            );

          await updateDogGameImages(gameId, {
            image: finalImageUrl,
            steps: stepsForPatch,
          });

          // Invalidate lists and detail so DataCollectionPage reloads on return
          queryClient.invalidateQueries({ queryKey: ['dog-games'] });
          queryClient.invalidateQueries({ queryKey: ['dog-game', gameId] });

          toast.success(
            submitIntent === 'publish'
              ? 'Game images updated and published'
              : 'Game images updated as draft',
          );
        } else {
          // Local-only games are still updated via local store
          await updateDogGameMutation(payload);
          queryClient.invalidateQueries({ queryKey: ['dog-games'] });
          if (gameId) {
            queryClient.invalidateQueries({ queryKey: ['dog-game', gameId] });
          }
          toast.success(
            submitIntent === 'publish'
              ? 'Game updated and published'
              : 'Game updated as draft',
          );
        }
      } else if (gameId) {
        // For create mode, update the game we just created in the local store
        await updateDogGame(gameId, payload);
        queryClient.invalidateQueries({ queryKey: ['dog-games'] });
        queryClient.invalidateQueries({ queryKey: ['dog-game', gameId] });
        toast.success(
          submitIntent === 'publish'
            ? 'Game created and published'
            : 'Game saved as draft',
        );
      }

      // Clean up remaining blob URLs
      if (isBlobUrl(values.image)) {
        URL.revokeObjectURL(values.image);
      }
      values.steps.forEach((step) => {
        if (step.imageUrl && isBlobUrl(step.imageUrl)) {
          URL.revokeObjectURL(step.imageUrl);
        }
      });

      // Clear file refs
      coverImageFileRef.current = null;
      stepImageFilesRef.current.clear();

      navigate('/dog-games');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      toast.error(`Failed to save game: ${message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dog-games');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground">
            Enter the basic information, app display settings, and instructions
            for this game.
          </p>
        </div>
      </div>

      {(isEdit || isView) && isLoadingGame && (
        <p className="text-sm text-muted-foreground">Loading game…</p>
      )}

      <Form {...form}>
        <form
          onSubmit={isView ? (e) => e.preventDefault() : form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {isView && (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/dog-games/${id}/edit`)}
              >
                Edit
              </Button>
            </div>
          )}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Hide &amp; Seek"
                            {...field}
                            disabled={isView}
                            readOnly={isView}
                          />
                        </FormControl>
                        <FormDescription>
                          This is the name shown in the mobile app list.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Teach your dog to look for you or hidden treats…"
                            rows={3}
                            {...field}
                            disabled={isView}
                            readOnly={isView}
                          />
                        </FormControl>
                        <FormDescription>
                          Shown on the card in the app list (max 180
                          characters).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image</FormLabel>
                        <FormControl>
                          {isView ? (
                            field.value ? (
                              <div className="space-y-2">
                                <img
                                  src={field.value}
                                  alt="Cover"
                                  className="h-48 w-48 object-cover rounded-md"
                                />
                                <Input
                                  value={field.value}
                                  readOnly
                                  disabled
                                />
                              </div>
                            ) : (
                              <Input value="No image" readOnly disabled />
                            )
                          ) : (
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;

                                // Store file object for later upload
                                coverImageFileRef.current = file;

                                // Create preview URL
                                const objectUrl = URL.createObjectURL(file);
                                field.onChange(objectUrl);
                              }}
                            />
                          )}
                        </FormControl>
                        <FormDescription>
                          {isView
                            ? 'Cover image for this game.'
                            : 'Upload an image file. A preview will appear in the Object Preview card.'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FormLabel>Steps</FormLabel>
                      {!isView && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            appendStep({
                              stepNo: stepFields.length + 1,
                              title: '',
                              description: '',
                            })
                          }
                        >
                          Add step
                        </Button>
                      )}
                    </div>
                    <div className="space-y-4">
                      {stepFields.map((field, index) => (
                        <Card key={field.id}>
                          <CardContent className="space-y-3 pt-4">
                            <div className="flex items-center justify-between">
                              <FormLabel>Step {index + 1}</FormLabel>
                              {!isView && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeStep(index)}
                                  disabled={stepFields.length === 1}
                                >
                                  ✕
                                </Button>
                              )}
                            </div>
                            <FormField
                              control={form.control}
                              name={`steps.${index}.title`}
                              render={({ field: fieldProps }) => (
                                <FormItem>
                                  <FormLabel>Title</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Get your dog ready"
                                      {...fieldProps}
                                      disabled={isView}
                                      readOnly={isView}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`steps.${index}.description`}
                              render={({ field: fieldProps }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Ask your dog to stay while you hide nearby…"
                                      rows={3}
                                      {...fieldProps}
                                      disabled={isView}
                                      readOnly={isView}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`steps.${index}.imageUrl`}
                              render={({ field: fieldProps }) => (
                                <FormItem>
                                  <FormLabel>Step Image</FormLabel>
                                  <FormControl>
                                    {isView ? (
                                      fieldProps.value ? (
                                        <div className="space-y-2">
                                          <div className="h-48 w-48 overflow-hidden rounded-md bg-muted">
                                            <img
                                              src={fieldProps.value}
                                              alt={`Step ${index + 1}`}
                                              className="h-full w-full object-cover"
                                            />
                                          </div>
                                          <Input
                                            value={fieldProps.value}
                                            readOnly
                                            disabled
                                          />
                                        </div>
                                      ) : (
                                        <Input value="No image" readOnly disabled />
                                      )
                                    ) : (
                                      <div className="space-y-2">
                                        {fieldProps.value && (
                                          <div className="h-48 w-48 overflow-hidden rounded-md bg-muted border">
                                            <img
                                              src={fieldProps.value}
                                              alt={`Step ${index + 1} preview`}
                                              className="h-full w-full object-cover"
                                            />
                                          </div>
                                        )}
                                        <Input
                                          type="file"
                                          accept="image/*"
                                          onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            if (!file) return;

                                            // Store file object for later upload
                                            stepImageFilesRef.current.set(index, file);

                                            // Create preview URL
                                            const objectUrl = URL.createObjectURL(file);
                                            fieldProps.onChange(objectUrl);
                                          }}
                                        />
                                        {fieldProps.value && (
                                          <p className="text-xs text-muted-foreground">
                                            Current image preview above. Upload a new image to replace it.
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </FormControl>
                                  <FormDescription>
                                    {isView
                                      ? 'Step image for this instruction step.'
                                      : 'Upload an image for this step. A preview will appear above.'}
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="tips"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tips</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Optional tips to help guardians run this game successfully."
                            rows={3}
                            {...field}
                            disabled={isView}
                            readOnly={isView}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="safetyNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Safety Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any safety considerations or when to stop the game."
                            rows={3}
                            {...field}
                            disabled={isView}
                            readOnly={isView}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Object Preview</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  {form.watch('image') ? (
                    <div className="h-32 w-32 overflow-hidden rounded-full bg-muted">
                      <img
                        src={form.watch('image')}
                        alt="Cover preview"
                        className="h-full w-full"
                      />
                    </div>
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted px-4 text-center text-xs text-muted-foreground">
                      Image preview will appear here after you upload a file.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>App Display Config</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="categoryName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Games" {...field} disabled={true} readOnly={true} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty</FormLabel>
                          <FormControl>
                            {isView ? (
                              <Input value={field.value || 'N/A'} readOnly disabled />
                            ) : (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Easy">Easy</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="Hard">Hard</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}

                    {/* <FormField
                      control={form.control}
                      name="ageGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age Group</FormLabel>
                          <FormControl>
                            {isView ? (
                              <Input value={field.value || 'N/A'} readOnly disabled />
                            ) : (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Puppy">Puppy</SelectItem>
                                  <SelectItem value="Junior">Junior</SelectItem>
                                  <SelectItem value="Adult">Adult</SelectItem>
                                  <SelectItem value="Senior">Senior</SelectItem>
                                  <SelectItem value="All">All</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
                  </div>

                  {/* <FormField
                    control={form.control}
                    name="durationMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            value={field.value ?? ''}
                            onChange={(event) => {
                              const value = event.target.value;
                              field.onChange(
                                value === '' ? undefined : Number(value),
                              );
                            }}
                            disabled={isView}
                            readOnly={isView}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  {/* <FormField
                    control={form.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            value={field.value}
                            onChange={(event) =>
                              field.onChange(Number(event.target.value))
                            }
                            disabled={isView}
                            readOnly={isView}
                          />
                        </FormControl>
                        <FormDescription>
                          Lower numbers appear higher in the app list.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  <FormField
                    control={form.control}
                    name="visibleInApp"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Visible in App</FormLabel>
                          <FormDescription>
                            If off, this game will not be shown to end users.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isView}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          {isView ? (
                            <Input value={field.value} readOnly disabled />
                          ) : (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {!isView && (
                <div className="flex flex-col gap-2 md:flex-row md:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSubmitIntent('draft');
                      form.handleSubmit(onSubmit)();
                    }}
                    disabled={isSubmitting}
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setSubmitIntent('publish');
                      form.handleSubmit(onSubmit)();
                    }}
                    disabled={isSubmitting}
                  >
                    Publish
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              {/* {isView && (
                <div className="flex flex-col gap-2 md:flex-row md:justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                  >
                    Back
                  </Button>
                </div>
              )} */}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

