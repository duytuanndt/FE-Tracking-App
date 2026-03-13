/* 
list api 
get api: https://dogtraining-api.fuentechsoft.com/api/v1/training/categories => list training categories

get api: https://dogtraining-api.fuentechsoft.com/api/v1/training/all-lessons/{categoryKey} => list all lessons for a category
sample: https://dogtraining-api.fuentechsoft.com/api/v1/training/all-lessons/basic_obedience => Returns list of training lessons for the requested category

get api: https://dogtraining-api.fuentechsoft.com/api/v1/training/lessons/{lessonId} => get a lesson detail by id


schema collection save on database:
1. training_categories:
const translationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  {
    _id: false,
  }
);

export const trainingCategorySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    originalName: { type: String, required: true },
    lessonCount: { type: Number, required: true },
    imageUrl: { type: String, default: "" },
    translations: {
      type: Map,
      of: translationSchema,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "training_categories",
  }
);

sample data::
[
  {
      "id": "69a68afa405a72010c39a33d",
      "key": "basic_obedience",
      "name": "Basic Obedience",
      "originalName": "Basic Obedience",
      "lessonCount": 8,
      "imageUrl": ""
    },
    {
      "id": "69a68afa405a72010c39a33f",
      "key": "behavior_issues",
      "name": "Behavior Issues",
      "originalName": "Behavior Issues",
      "lessonCount": 7,
      "imageUrl": ""
    },
]

2. training_lessons:
const lessonStepBaseSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    originalTitle: { type: String, required: true },
    originalDescription: { type: String, default: "" },
    originalContentProTip: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  {
    _id: false,
  }
);

const lessonStepTranslationSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    contentProTip: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  {
    _id: false,
  }
);

const lessonTranslationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    steps: {
      type: [lessonStepTranslationSchema],
      default: [],
    },
  },
  {
    _id: false,
  }
);

export const lessonSchema = new mongoose.Schema(
  {
    categoryKey: { type: String, required: true, index: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingCategory",
      required: false,
    },
    status: { type: String, default: "New", enum: ["New", "Published", "Archived", "Draft", "Deleted", "Locked", "Hidden"] },
    sortOrder: { type: Number, index: true },
    imageUrl: { type: String, default: "" },
    originalTitle: { type: String, required: true },
    originalDescription: { type: String, default: "" },
    steps: {
      type: [lessonStepBaseSchema],
      default: [],
    },
    translations: {
      type: Map,
      of: lessonTranslationSchema,
      default: {},
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: "training_lessons",
  }
);

sample data::
{
  "success": true,
  "language": "en",
  "data": {
    "_id": "69ae3b6524bc86d2893a03af",
    "categoryKey": "basic_obedience",
    "categoryId": "69a68afa405a72010c39a33d",
    "status": "New",
    "imageUrl": "",
    "originalTitle": "Respond to Name & Come When Called",
    "originalDescription": "",
    "translations": {
      "en": {
        "title": "Respond to Name & Come When Called",
        "description": "",
        "steps": [
          {
            "description": "Teach Name = Attention\n\nSay your dog’s name once in a happy voice.\nWhen they\n look at you → say “Yes!” → give a treat.\nRepeat 8-10 times per session.",
            "contentProTip": "",
            "imageUrl": "",
            "order": 1,
            "title": "Step 1"
          },
          {
            "description": "Reward Eye Contact\n\nMark and reward immediately when they make eye\n contact.\nYour dog learns:\nName = Focus on my human = Good things happen.\nKeep sessions short (5\n minutes).",
            "contentProTip": "",
            "imageUrl": "",
            "order": 2,
            "title": "Step 2"
          },
          {
            "description": "Add Movement\n\nSay their name → step backward.\nWhen they move toward you →\n reward.\nMake yourself exciting and inviting!\n\nPro Tip: Run\n backwards when calling.Dogs love to chase - it boosts speed and enthusiasm instantly.",
            "contentProTip": "",
            "imageUrl": "",
            "order": 3,
            "title": "Step 3"
          },
          {
            "description": "Add the Cue “Come”\n\nNow say:\n“Buddy, Come!”\nWhen your dog reaches you:\n Mark/Treat/Praise\nAlways reward when they arrive.",
            "contentProTip": "",
            "imageUrl": "",
            "order": 4,
            "title": "Step 4"
          },
          {
            "description": "Practice & Level Up\n\nStart close → increase distance slowly.\nPractice\n indoors first, then backyard (use a long leash).\n✔ 8 out of 10 successful recalls = ready for distractions.",
            "contentProTip": "",
            "imageUrl": "",
            "order": 5,
            "title": "Step 5"
          }
        ]
      }
    }
  },
  "total": 1
}

upload image api: https://dogtraining-api.fuentechsoft.com/api/v1/products/pre-signed-url
Returns a pre-signed Cloudflare R2 URL that the client can use to upload an image directly using HTTP PUT. This reduces load on the backend by sending the file straight to R2. Inspired by the approach in Ruan Martinelli's article on uploading to Cloudflare R2 with pre-signed URLs.
Request:
{
  "productId": "string",
  "contentType": "string",
  "fileName": "string"
}
Response:
{
  "key": "string",
  "url": "string",
  "bucket": "string",
  "expiresAt": "2026-03-12T02:06:13.801Z"
}
** service also handle in file apis/r2Upload.ts
when upload should enter lesson id and all step ids, step images url should be updated

Update lesson api: https://dogtraining-api.fuentechsoft.com/api/v1/training/lessons/{lessonId}/images
Request:
{
  "imageUrl": "string",
  "steps": [
    {
      "stepId": "string",
      "imageUrl": "string"
    }
  ]
}

param id: lesson id 69ae3b6624bc86d2893a03b2
request body:{
  "imageUrl": "https://cdn.example.com/lessons/cover.png",
  "steps": [
    {
      "_id": "64step001",
      "imageUrl": "https://cdn.example.com/lessons/step1.png"
    }
  ]
}

// implementation new modules for dog training lessons: same as dogGames.ts and modules: pages/DataCollection/DogTrainingLessonFormPage.tsx and pages/DataCollection/DogTrainingLessonDetailPage.tsx 
*/

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --- Types ---

export interface TrainingCategory {
  id: string;
  key: string;
  name: string;
  originalName: string;
  lessonCount: number;
  imageUrl: string;
}

export type TrainingLessonStatus =
  | 'New'
  | 'Published'
  | 'Archived'
  | 'Draft'
  | 'Deleted'
  | 'Locked'
  | 'Hidden';

export interface TrainingLessonStep {
  order: number;
  title: string;
  description: string;
  contentProTip?: string;
  imageUrl?: string;
  // Optional backend identifier for this step, used when patching images
  stepId?: string;
}

export interface TrainingLesson {
  id: string;
  categoryKey: string;
  categoryId?: string;
  status: TrainingLessonStatus;
  imageUrl: string;
  title: string;
  description: string;
  language: string;
  steps: TrainingLessonStep[];
}

export interface TrainingLessonImagesUpdateInput {
  imageUrl: string;
  steps: {
    stepId: string;
    imageUrl: string;
  }[];
  /**
   * Optional updated description for the lesson, used on the detail page.
   */
  originalDescription?: string;
}

// --- Helpers ---

function safeGet<TObj extends Record<string, any>, TValue, TDefault>(
  obj: TObj | null | undefined,
  path: string[],
  defaultValue: TDefault,
): TValue | TDefault {
  let current: any = obj;
  for (const key of path) {
    if (current == null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  return (current as TValue) ?? defaultValue;
}

function normalizeCategory(raw: any): TrainingCategory {
  const id: string = String(raw._id ?? raw.id ?? '');
  const key: string = String(raw.key ?? '');
  const originalName: string = String(raw.originalName ?? raw.name ?? '');
  const name: string =
    (safeGet<typeof raw, any, undefined>(
      raw,
      ['translations', 'en', 'name'],
      undefined,
    ) as string | undefined) ?? originalName;

  const lessonCount: number =
    typeof raw.lessonCount === 'number' ? raw.lessonCount : 0;

  const imageUrl: string = String(raw.imageUrl ?? '');

  return {
    id,
    key,
    name,
    originalName,
    lessonCount,
    imageUrl,
  };
}

function normalizeLesson(
  raw: any,
  languageFromResponse?: string,
): TrainingLesson {
  const id: string = String(raw._id ?? raw.id ?? '');
  const categoryKey: string = String(raw.categoryKey ?? '');
  const categoryId: string | undefined =
    typeof raw.categoryId === 'string' ? raw.categoryId : undefined;

  const status: TrainingLessonStatus =
    (raw.status as TrainingLessonStatus) ?? 'New';

  const imageUrl: string = String(raw.imageUrl ?? '');

  const language: string =
    String(languageFromResponse || raw.language || 'en') || 'en';

  const translationForLang = safeGet<typeof raw, any, any>(
    raw,
    ['translations', language],
    null,
  );

  const title: string =
    translationForLang?.title ?? raw.originalTitle ?? 'Untitled lesson';

  const description: string =
    translationForLang?.description ?? raw.originalDescription ?? '';

  const stepsSource: any[] =
    Array.isArray(translationForLang?.steps) && translationForLang.steps.length
      ? translationForLang.steps
      : Array.isArray(raw.steps)
        ? raw.steps
        : [];

  const steps: TrainingLessonStep[] = stepsSource.map((stepRaw: any) => ({
    order:
      typeof stepRaw.order === 'number'
        ? stepRaw.order
        : typeof stepRaw.stepNo === 'number'
          ? stepRaw.stepNo
          : 0,
    title: String(stepRaw.title ?? stepRaw.originalTitle ?? 'Step'),
    description: String(
      stepRaw.description ?? stepRaw.originalDescription ?? '',
    ),
    contentProTip: stepRaw.contentProTip ?? stepRaw.originalContentProTip,
    imageUrl: stepRaw.imageUrl ?? '',
    stepId:
      typeof stepRaw._id === 'string' || typeof stepRaw.stepId === 'string'
        ? (stepRaw.stepId ?? stepRaw._id)
        : undefined,
  }));

  return {
    id,
    categoryKey,
    categoryId,
    status,
    imageUrl,
    title,
    description,
    language,
    steps,
  };
}

// --- Core service functions ---

export async function getTrainingCategories(): Promise<TrainingCategory[]> {
  const res = await fetch(
    'https://dogtraining-api.fuentechsoft.com/api/v1/training/categories',
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch training categories: ${res.status}`);
  }

  const response: any = await res.json();

  const rawItems: any[] =
    response?.success === true && Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : [];

  return rawItems.map(normalizeCategory);
}

export async function getTrainingLessonsByCategory(
  categoryKey: string,
): Promise<TrainingLesson[]> {
  if (!categoryKey) return [];

  const res = await fetch(
    `https://dogtraining-api.fuentechsoft.com/api/v1/training/all-lessons/${encodeURIComponent(
      categoryKey,
    )}`,
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch training lessons for category ${categoryKey}: ${res.status}`,
    );
  }

  const response: any = await res.json();
  const language: string | undefined = response?.language;

  const rawItems: any[] =
    response?.success === true && Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

  return rawItems.map((raw) => normalizeLesson(raw, language));
}

export async function getTrainingLessonById(
  lessonId: string,
): Promise<TrainingLesson | null> {
  if (!lessonId) return null;

  const res = await fetch(
    `https://dogtraining-api.fuentechsoft.com/api/v1/training/lesson/${lessonId}`,
  );

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(
      `Failed to fetch training lesson detail: ${res.status}`,
    );
  }

  const response: any = await res.json();
  const language: string | undefined = response?.language;

  const raw =
    response?.success === true && response?.data
      ? response.data
      : response?.data ?? response;

  if (!raw) return null;
  return normalizeLesson(raw, language);
}

export async function updateTrainingLessonStatus(
  lessonId: string,
  status: TrainingLessonStatus,
): Promise<void> {
  if (!lessonId) {
    throw new Error('lessonId is required to update lesson status');
  }

  const res = await fetch(
    `https://dogtraining-api.fuentechsoft.com/api/v1/training/lesson/${lessonId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ status }),
    },
  );

  if (!res.ok) {
    let errorText = '';
    try {
      errorText = await res.text();
    } catch {
      // ignore
    }
    throw new Error(
      `Failed to update lesson status: ${res.status}${
        errorText ? ` - ${errorText}` : ''
      }`,
    );
  }
}

export async function updateTrainingLessonImages(
  lessonId: string,
  input: TrainingLessonImagesUpdateInput,
): Promise<void> {
  if (!lessonId) {
    throw new Error('lessonId is required to update lesson images');
  }

  // console.log('lessonId', lessonId);
  // console.log('input', input);

  //https://dogtraining-api.fuentechsoft.com
  const res = await fetch(
    `https://dogtraining-api.fuentechsoft.com/api/v1/training/lesson/${lessonId}/images`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        imageUrl: input.imageUrl,
        steps: input.steps.map((s) => ({
          stepId: s.stepId,
          imageUrl: s.imageUrl,
        })),
        ...(typeof input.originalDescription === 'string'
          ? { originalDescription: input.originalDescription }
          : {}),
      }),
    },
  );

  if (!res.ok) {
    let errorText = '';
    try {
      errorText = await res.text();
    } catch {
      // ignore
    }
    throw new Error(
      `Failed to update lesson images: ${res.status}${
        errorText ? ` - ${errorText}` : ''
      }`,
    );
  }
}

// --- React Query hooks ---

export function useTrainingCategories() {
  return useQuery({
    queryKey: ['training-categories'],
    queryFn: () => getTrainingCategories(),
  });
}

export function useTrainingLessonsByCategory(categoryKey: string | undefined) {
  return useQuery({
    queryKey: ['training-lessons', { categoryKey }],
    queryFn: () =>
      categoryKey ? getTrainingLessonsByCategory(categoryKey) : Promise.resolve([]),
    enabled: !!categoryKey,
  });
}

export function useTrainingLesson(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['lesson-detail', lessonId],
    queryFn: () =>
      lessonId ? getTrainingLessonById(lessonId) : Promise.resolve(null),
    enabled: !!lessonId,
  });
}

export function useUpdateTrainingLessonImages(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TrainingLessonImagesUpdateInput) =>
      updateTrainingLessonImages(lessonId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['lesson-detail', lessonId],
      });
      queryClient.invalidateQueries({
        queryKey: ['training-lessons'],
      });
    },
  });
}

export function useUpdateTrainingLessonStatus(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: TrainingLessonStatus) =>
      updateTrainingLessonStatus(lessonId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['lesson-detail', lessonId],
      });
      queryClient.invalidateQueries({
        queryKey: ['training-lessons'],
      });
    },
  });
}