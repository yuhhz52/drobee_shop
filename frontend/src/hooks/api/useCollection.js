import { useState, useEffect } from 'react';
import { fetchCollectionBySlug } from '@services/collection.service';

/**
 * Hook to fetch and resolve a collection by slug from backend.
 * Returns collection config from DB (backend-driven slug resolution).
 * @param {string|null} slug - The collection slug from URL
 * @returns {{ collection: object|null, loading: boolean, error: string|null }}
 */
export const useCollection = (slug) => {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setCollection(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchCollectionBySlug(slug)
      .then((data) => {
        if (!cancelled) {
          setCollection(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || 'Failed to load collection');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { collection, loading, error };
};
