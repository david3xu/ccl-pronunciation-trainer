/**
 * Vocabulary Loader Service
 *
 * Shared cache for vocabulary datasets.  Both AppContent and SettingsPanel
 * call `loadVocabulary()` so the same dataset is never fetched twice.
 */

import { appConfig } from '../../config/AppConfig';
import type { PracticeItem, VocabularyTerm } from '../../types/dataset.types';

export type DatasetItem = VocabularyTerm | PracticeItem | Record<string, unknown>;

interface CacheEntry {
  items: DatasetItem[];
  fetchedAt: number;
}

const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

function transformShadowingItems(answers: Record<string, unknown>[], bookId: string): DatasetItem[] {
  return answers.map((answer) => ({
    english: (answer['title'] as string) || (answer['fullText'] as string)?.substring(0, 50),
    pronunciation: {
      british: { ipa: '', phonetic: 'DI Answer' },
      american: { ipa: '', phonetic: 'DI Answer' },
    },
    difficulty: 'normal',
    category: bookId,
    source: bookId,
    ...answer,
  }));
}

function transformSegmentItems(items: Record<string, unknown>[], bookId: string): DatasetItem[] {
  return items.map((item) => {
    const content = item['content'] as Record<string, unknown> | undefined;
    const metadata = item['metadata'] as Record<string, unknown> | undefined;
    return {
      id: item['id'],
      english: (content?.['sentence'] as string) || '',
      ipa: content?.['ipa'],
      difficulty: (metadata?.['difficulty'] as string) || 'normal',
      category: (metadata?.['category'] as string) || 'general',
      wordCount: metadata?.['wordCount'],
      type: item['type'],
      source: bookId,
    };
  });
}

/**
 * Load vocabulary for the given book ID. Returns cached data when available.
 */
export async function loadVocabulary(
  bookId: string,
  options?: { signal?: AbortSignal; forceRefresh?: boolean },
): Promise<DatasetItem[]> {
  const now = Date.now();
  const cached = cache.get(bookId);

  if (cached && !options?.forceRefresh && now - cached.fetchedAt < MAX_AGE_MS) {
    return cached.items;
  }

  const dataPaths: Record<string, string> = appConfig.get('data.paths.byMode');
  const processedPath: string = appConfig.get('data.paths.processed');
  const basePath = dataPaths[bookId] || `/${processedPath}/${bookId}-vocabulary.json`;

  const response = await fetch(basePath, { signal: options?.signal });
  if (!response.ok) {
    throw new Error(`Failed to load vocabulary: ${response.statusText}`);
  }

  const data = await response.json();
  let items: DatasetItem[] = data.vocabulary || data.answers || data.items || [];

  if (data.answers) {
    items = transformShadowingItems(items as Record<string, unknown>[], bookId);
  } else if (items.length > 0 && (items[0] as Record<string, unknown>)?.['content']) {
    const raw = items as unknown as Record<string, unknown>[];
    if ((raw[0]?.['content'] as Record<string, unknown>)?.['sentence']) {
      items = transformSegmentItems(raw, bookId);
    }
  }

  cache.set(bookId, { items, fetchedAt: now });
  return items;
}

/** Evict a specific book from the cache. */
export function invalidateCache(bookId?: string): void {
  if (bookId) {
    cache.delete(bookId);
  } else {
    cache.clear();
  }
}
