import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'Artwork' | 'Marketplace';
  route: string;
  imageUrl?: string;
  /** Pre-formatted subtitle e.g. "by JMZ Arts" or "$24.99 · Painting" */
  meta: string;
}

interface UseGlobalSearchReturn {
  results: SearchResult[];
  isLoading: boolean;
  hasQuery: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 500;
const MAX_RESULTS_PER_COLLECTION = 5;

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useGlobalSearch
 *
 * Performs debounced, parallel Firestore queries across `artworks` and
 * `marketItems` collections. Returns a flat, ranked list of results.
 *
 * Security: Queries are scoped to public artworks and available market items.
 * Rate-limiting: Debounced at 500ms to prevent excessive Firestore reads.
 */
export function useGlobalSearch(rawQuery: string): UseGlobalSearchReturn {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trimmedQuery = rawQuery.trim();
  const hasQuery = trimmedQuery.length > 0;

  useEffect(() => {
    // Clear previous debounce timer on every keystroke
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // If search is cleared, immediately clear results
    if (!hasQuery) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Show loading state immediately on first character
    setIsLoading(true);

    // Debounce the actual Firestore call
    debounceRef.current = setTimeout(async () => {
      try {
        const q = trimmedQuery.toLowerCase();

        // ── Parallel Firestore queries ──────────────────────────────────────
        const [artworkSnap, marketSnap] = await Promise.all([
          // Artworks: public only, ordered by most recent
          getDocs(
            query(
              collection(db, 'artworks'),
              where('privacy', '==', 'public'),
              orderBy('createdAt', 'desc'),
              limit(50) // fetch a batch, then filter client-side by title
            )
          ),
          // Market items: available only, ordered by most recent
          getDocs(
            query(
              collection(db, 'marketItems'),
              where('status', '==', 'available'),
              orderBy('createdAt', 'desc'),
              limit(50)
            )
          ),
        ]);

        // ── Map and filter artworks ─────────────────────────────────────────
        const artworkResults: SearchResult[] = artworkSnap.docs
          .map((doc) => {
            const d = doc.data() as any;
            return {
              id: doc.id,
              title: d.title ?? '',
              description: d.category ?? '',
              category: 'Artwork' as const,
              route: '/gallery',
              imageUrl: d.imageUrl,
              meta: `by ${d.authorName ?? 'Unknown'}`,
            };
          })
          .filter(
            (item) =>
              item.title.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q) ||
              item.meta.toLowerCase().includes(q)
          )
          .slice(0, MAX_RESULTS_PER_COLLECTION);

        // ── Map and filter market items ─────────────────────────────────────
        const marketResults: SearchResult[] = marketSnap.docs
          .map((doc) => {
            const d = doc.data() as any;
            return {
              id: doc.id,
              title: d.title ?? '',
              description: d.description ?? '',
              category: 'Marketplace' as const,
              route: '/community/marketplace',
              imageUrl: d.imageUrl,
              meta: `$${d.price ?? 0} · ${d.category ?? ''}`,
            };
          })
          .filter(
            (item) =>
              item.title.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q) ||
              item.meta.toLowerCase().includes(q)
          )
          .slice(0, MAX_RESULTS_PER_COLLECTION);

        // Artworks first, then marketplace — most relevant sections first
        setResults([...artworkResults, ...marketResults]);
      } catch (error) {
        console.error('[useGlobalSearch] Firestore query failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    // Cleanup on unmount or query change
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [trimmedQuery, hasQuery]);

  return { results, isLoading, hasQuery };
}
