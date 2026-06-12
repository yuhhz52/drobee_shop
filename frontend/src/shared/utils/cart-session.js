/**
 * Cart session ID is stored in a browser cookie (httpOnly=false) set by the server.
 * The FE reads it from document.cookie to include in the fetchCart request body
 * or to display the cart count when user is anonymous.
 *
 * Session is automatically created on first POST /cart/items.
 */

const SESSION_KEY = 'cart_session';

/** Returns the cart session ID from browser cookie. */
export const getCartSessionId = () => {
  const match = document.cookie.match(new RegExp(`(^| )${SESSION_KEY}=([^;]+)`));
  return match?.[2] || null;
};

/** Reads Set-Cookie from axios response and persists to localStorage as fallback. */
export const setCartSessionId = (res) => {
  const setCookie = res?.headers?.['set-cookie'];
  if (!setCookie) return;

  const cookieStr = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  const idMatch = cookieStr.match(new RegExp(`${SESSION_KEY}=([^;]+)`));
  if (idMatch?.[1]) {
    localStorage.setItem(SESSION_KEY, idMatch[1]);
  }
};

/** Clears both cookie and localStorage fallback. */
export const clearCartSession = () => {
  localStorage.removeItem(SESSION_KEY);
  document.cookie = `${SESSION_KEY}=; Max-Age=0; Path=/`;
};
