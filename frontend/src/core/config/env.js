export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY ?? '';

export const env = {
  apiBaseUrl: API_BASE_URL,
  stripePublicKey: STRIPE_PUBLIC_KEY,
};
