import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type DogGameStatus = 'draft' | 'published' | 'archived';

export interface DogGameStep {
  stepNo: number;
  title: string;
  description: string;
  imageUrl?: string;
  // Optional backend identifier for the step/imageStepOrder entry
  stepId?: string;
}

export interface DogGame {
  id: string;
  name: string;
  shortDescription: string;
  image: string;
  categoryName: string;
  difficulty?: string;
  ageGroup?: string;
  durationMinutes?: number;
  displayOrder: number;
  status: DogGameStatus;
  visibleInApp: boolean;
  steps: DogGameStep[];
  tips?: string;
  safetyNotes?: string;
  createdAt: string;
  updatedAt: string;
  source?: 'remote' | 'local';
}

export interface DogGamesListParams {
  page: number;
  limit: number;
  keyword?: string;
  status?: DogGameStatus | 'all';
}

export interface DogGamesListResponse {
  items: DogGame[];
  total: number;
}

export type DogGameInput = Omit<
  DogGame,
  'id' | 'createdAt' | 'updatedAt' | 'source'
>;

export interface DogGameStepImageUpdate {
  _id: string;
  image: string;
}

// --- Local-only store for games created via admin UI ---

let localDogGamesDb: DogGame[] = [];

// Helper to safely read nested properties from API responses
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

// Map raw exercise JSON from Dog Training API into our DogGame model.
function mapExerciseToDogGame(raw: any): DogGame {
  const id: string = String(raw._id ?? raw.id ?? '');

  const name: string =
    raw.name ??
    raw.title ??
    raw.exerciseName ??
    'Untitled exercise';

  const shortDescription: string =
    raw.shortDescription ??
    raw.description ??
    raw.summary ??
    '';

  const image: string =
    raw.image ??
    raw.coverImageUrl ??
    raw.imageUrl ??
    safeGet<typeof raw, string | undefined, string>(
      raw,
      ['images', '0', 'url'],
      '',
    ) ??
    '';

  const categoryName: string =
    raw.categoryName ??
    safeGet<typeof raw, string | undefined, string>(
      raw,
      ['category', 'name'],
      '',
    ) ??
    'Games';

  const difficulty: string | undefined =
    raw.difficulty ??
    safeGet<typeof raw, string | undefined, undefined>(
      raw,
      ['difficulty', 'name'],
      undefined,
    );

  const ageGroup: string | undefined =
    raw.ageGroup ??
    safeGet<typeof raw, string | undefined, undefined>(
      raw,
      ['ageGroup', 'name'],
      undefined,
    );

  const durationMinutes: number | undefined =
    typeof raw.durationMinutes === 'number'
      ? raw.durationMinutes
      : typeof raw.duration === 'number'
        ? raw.duration
        : undefined;

  // Fallback ordering: use explicit order field if present, else index
  const displayOrder: number =
    typeof raw.displayOrder === 'number'
      ? raw.displayOrder
      : typeof raw.sortOrder === 'number'
        ? raw.sortOrder
        : typeof raw.order === 'number'
          ? raw.order
          : 0;

  const status: DogGameStatus =
    (raw.status === 'published' ||
      raw.status === 'draft' ||
      raw.status === 'archived') &&
    raw.status
      ? raw.status
      : 'published';

  const visibleInApp: boolean =
    typeof raw.visibleInApp === 'boolean'
      ? raw.visibleInApp
      : true;

  // Map imageStepOrder array to steps array
  const steps: DogGameStep[] =
    Array.isArray(raw.imageStepOrder) && raw.imageStepOrder.length > 0
      ? raw.imageStepOrder.map((s: any, index: number) => ({
          stepNo: index + 1,
          title: `Step ${index + 1}`,
          description: s.description ?? '',
          imageUrl: s.image ?? s.imageUrl ?? undefined,
          stepId: typeof s._id === 'string' || typeof s.id === 'string'
            ? (s._id ?? s.id)
            : undefined,
        }))
      : Array.isArray(raw.steps) && raw.steps.length > 0
        ? raw.steps.map((s: any, index: number) => ({
            stepNo:
              typeof s.stepNo === 'number'
                ? s.stepNo
                : index + 1,
            title:
              s.title ??
              s.name ??
              `Step ${index + 1}`,
            description: s.description ?? '',
            imageUrl:
              s.imageUrl ??
              s.image ??
              safeGet<typeof s, string | undefined, undefined>(
                s,
                ['media', 'url'],
                undefined,
              ),
            stepId:
              typeof s._id === 'string' || typeof s.id === 'string'
                ? (s._id ?? s.id)
                : undefined,
          }))
        : [];

  const tips: string | undefined =
    typeof raw.tips === 'string'
      ? raw.tips
      : undefined;

  const safetyNotes: string | undefined =
    typeof raw.safetyNotes === 'string'
      ? raw.safetyNotes
      : undefined;

  const createdAt: string =
    raw.createdAt ??
    raw.created_at ??
    new Date().toISOString();

  const updatedAt: string =
    raw.updatedAt ??
    raw.updated_at ??
    createdAt;

  return {
    id,
    name,
    shortDescription,
    image,
    categoryName,
    difficulty,
    ageGroup,
    durationMinutes,
    displayOrder,
    status,
    visibleInApp,
    steps,
    tips,
    safetyNotes,
    createdAt,
    updatedAt,
    source: 'remote',
  };
}

// --- Core service functions (backed by real API for reads) ---

export async function getDogGames(
  params: DogGamesListParams,
): Promise<DogGamesListResponse> {
  const { page, limit, keyword, status } = params;

  const url = new URL(
    'https://dogtraining-api.fuentechsoft.com/api/v1/exercises',
  );
  url.searchParams.set('categoryId', 'id_games');

  if (keyword && keyword.trim()) {
    url.searchParams.set('search', keyword.trim());
  }

  try {
    const res = await fetch(url.toString());

    if (!res.ok) {
      throw new Error(`Failed to fetch dog games: ${res.status}`);
    }

    const response: any = await res.json();
    // Handle { success: true, data: [...] } structure
    const rawItems: any[] =
      response?.success === true && Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data) && response.data.length > 0
          ? response.data
          : Array.isArray(response)
            ? response
            : [];

    let remoteGames = rawItems.map(mapExerciseToDogGame);

    if (status && status !== 'all') {
      remoteGames = remoteGames.filter(
        (game) => game.status === status,
      );
    }

    // Merge in local-only items created via admin form
    let items: DogGame[] = [...remoteGames, ...localDogGamesDb];

    if (keyword && keyword.trim()) {
      const q = keyword.toLowerCase();
      items = items.filter(
        (game) =>
          game.name.toLowerCase().includes(q) ||
          game.shortDescription.toLowerCase().includes(q) ||
          game.categoryName.toLowerCase().includes(q),
      );
    }

    // Default sort: displayOrder asc, then updatedAt desc
    // items.sort((a, b) => {
    //   if (a.displayOrder !== b.displayOrder) {
    //     return a.displayOrder - b.displayOrder;
    //   }
    //   return (
    //     new Date(b.updatedAt).getTime() -
    //     new Date(a.updatedAt).getTime()
    //   );
    // });

    const total = items.length;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);
    console.log('paged', paged);

    return { items: paged, total };
  } catch (error) {
    // Let React Query surface this error
    throw error instanceof Error
      ? error
      : new Error('Unknown error fetching dog games');
  }
}

export async function getDogGameById(
  id: string,
): Promise<DogGame | null> {
  // Prefer local items created in this admin session
  const local = localDogGamesDb.find((g) => g.id === id);
  if (local) {
    return local;
  }

  try {
    const res = await fetch(
      `https://dogtraining-api.fuentechsoft.com/api/v1/exercises/${id}`,
    );

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch dog game detail: ${res.status}`);
    }

    const response: any = await res.json();
    // Handle { success: true, data: {...} } structure
    const raw =
      response?.success === true && response?.data
        ? response.data
        : response?.data ?? response;
    if (!raw) return null;
    return mapExerciseToDogGame(raw);
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Unknown error fetching dog game detail');
  }
}

// --- Create/update remain local-only for now ---

export async function createDogGame(
  input: DogGameInput,
): Promise<DogGame> {
  const now = new Date().toISOString();
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `dog-game-${Date.now()}`;

  const newGame: DogGame = {
    ...input,
    id,
    createdAt: now,
    updatedAt: now,
    source: 'local',
  };

  localDogGamesDb = [...localDogGamesDb, newGame];
  return newGame;
}

export async function updateDogGameImages(
  id: string,
  input: { image: string; steps: DogGameStepImageUpdate[] },
): Promise<void> {
  //`https://dogtraining-api.fuentechsoft.com
  const res = await fetch(
    `https://dogtraining-api.fuentechsoft.com/api/v1/exercises/${id}/images`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        image: input.image,
        steps: input.steps,
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
      `Failed to update exercise images: ${res.status}${
        errorText ? ` - ${errorText}` : ''
      }`,
    );
  }
}

export async function updateDogGame(
  id: string,
  input: Partial<DogGameInput>,
): Promise<DogGame> {
  const index = localDogGamesDb.findIndex((g) => g.id === id);
  if (index === -1) {
    throw new Error(
      'Only locally created games can be edited for now.',
    );
  }

  const existing = localDogGamesDb[index];
  const updated: DogGame = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  localDogGamesDb = [
    ...localDogGamesDb.slice(0, index),
    updated,
    ...localDogGamesDb.slice(index + 1),
  ];

  return updated;
}

// --- React Query convenience hooks ---

export function useDogGames(params: DogGamesListParams) {
  return useQuery({
    queryKey: ['dog-games', params],
    queryFn: () => getDogGames(params),
  });
}

export function useDogGame(id: string | undefined) {
  return useQuery({
    queryKey: ['dog-game', id],
    queryFn: () => (id ? getDogGameById(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useCreateDogGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DogGameInput) => createDogGame(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dog-games'] });
    },
  });
}

export function useUpdateDogGame(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<DogGameInput>) => updateDogGame(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dog-games'] });
      queryClient.invalidateQueries({ queryKey: ['dog-game', id] });
    },
  });
}

