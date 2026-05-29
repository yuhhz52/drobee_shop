import { useEffect, useRef, useState } from 'react';
import { productService } from '@services/product.service';

const DEBOUNCE_MS = 400;

export const useProductSearch = (searchTerm, { enabled = true, size = 5 } = {}) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled || !searchTerm?.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const { products } = await productService.getAll({
          name: searchTerm,
          page: 0,
          size,
        });
        setResults(products || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [searchTerm, enabled, size]);

  return { results, loading };
};
