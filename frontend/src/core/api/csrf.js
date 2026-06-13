const CSRF_COOKIE = 'XSRF-TOKEN';
const CSRF_HEADER = 'X-CSRF-Token';

/** Read CSRF token from non-HttpOnly cookie set by the server. */
const readCsrfToken = () => {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE}=([^;]+)`));
  return match?.[1] || null;
};

/** Attach CSRF token to outgoing state-changing requests, and capture new
 *  token from response header for first-load persistence.
 */
export const applyCsrfInterceptor = (client) => {
  client.interceptors.request.use((config) => {
    const method = (config.method || 'get').toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const token = readCsrfToken();
      if (token) {
        config.headers[CSRF_HEADER] = token;
      }
    }
    return config;
  });

  client.interceptors.response.use((res) => {
    // Server sends the current CSRF token in the X-CSRF-Token response header.
    // The browser already updated the cookie; nothing to do here.
    return res;
  });
};
