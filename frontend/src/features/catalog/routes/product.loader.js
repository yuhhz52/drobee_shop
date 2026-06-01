import store from '@app/store';
import { getProductBySlug } from '@services/product.service';
import { setLoading } from '@app/store/slices/common.jsx';

export const loaderProductBySlug = async ({ params }) => {
  try {
    store.dispatch(setLoading(true));

    if (!params.productSlug) {
      throw new Response('Product slug is required', { status: 400 });
    }

    const product = await getProductBySlug(params.productSlug);

    if (!product) {
      throw new Response('Product not found', { status: 404 });
    }

    return { product };
  } catch (err) {
    console.error('Error fetching product by slug:', err);

    if (err instanceof Response) {
      throw err;
    }

    if (err.response) {
      const status = err.response.status;
      const message =
        err.response.data?.message || err.message || 'Failed to fetch product';
      throw new Response(message, { status, statusText: message });
    }

    if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
      throw new Response(
        'Cannot reach the API server. Start the backend on port 8080, then refresh.',
        { status: 503, statusText: 'Service unavailable' }
      );
    }

    throw new Response(err.message || 'Internal server error', { status: 500 });
  } finally {
    store.dispatch(setLoading(false));
  }
};
