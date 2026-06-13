/**
 * Cart session ID is stored in an HttpOnly cookie set by the server.
 * The browser automatically attaches the cookie to every request, so the
 * FE does not need to read it directly.
 *
 * Because HttpOnly cookies cannot be read via document.cookie, the FE
 * cannot derive a session ID from the client. Cart state (item count,
 * contents) is fetched through the API and rendered from the response.
 *
 * No localStorage fallback is needed: the server is the source of truth.
 */

export const getCartSessionId = () => {
  // HttpOnly cookie is opaque to JS by design. The server uses it implicitly.
  return null;
};

export const setCartSessionId = () => {
  // No-op: the server sets the HttpOnly cookie on first cart write.
};

export const clearCartSession = () => {
  // Cannot clear HttpOnly cookie from JS — the server handles cart reset
  // through DELETE /api/cart. Frontend triggers a clearCart() call instead.
};
