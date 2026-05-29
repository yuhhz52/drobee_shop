import { useCallback, useEffect, useState } from 'react';
import { productService } from '@services/product.service';

export const useProducts = (params = {}, deps = []) => {
  const [products, setProducts] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getAll(params);
      setProducts(res.products || []);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      setError(err);
      setProducts([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params), ...deps]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { products, totalElements, loading, error, refetch: fetch };
};
