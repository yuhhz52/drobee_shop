package com.yuhecom.shopecom.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.Set;

/**
 * Double-submit cookie CSRF protection for state-changing requests that rely on
 * session cookies (e.g. anonymous cart operations). Authenticated users with
 * Authorization: Bearer header are exempt because the browser cannot set custom
 * headers from cross-origin without triggering a CORS preflight.
 *
 * Token strategy:
 * - On the first request, if the CSRF cookie is missing, the filter generates
 *   a random 32-byte token, sets it as a non-HttpOnly cookie, and also returns
 *   it in the X-CSRF-Token response header so the FE can persist it.
 * - For POST/PUT/PATCH/DELETE on protected paths, the request must include
 *   the same token in the X-CSRF-Token header.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
@RequiredArgsConstructor
@Slf4j
public class CsrfFilter extends OncePerRequestFilter {

    private static final String CSRF_COOKIE = "XSRF-TOKEN";
    private static final String CSRF_HEADER = "X-CSRF-Token";
    private static final Set<String> PROTECTED_PREFIXES = Set.of(
            "/api/cart/items",
            "/api/cart/add"
    );

    private static final Set<String> SAFE_METHODS = Set.of("GET", "HEAD", "OPTIONS");
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int TOKEN_BYTES = 32;
    private static final int COOKIE_MAX_AGE = 60 * 60 * 24; // 24h

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        String authHeader = request.getHeader("Authorization");

        // Bearer-authenticated requests are protected by CORS, not CSRF
        boolean isBearerAuth = authHeader != null && authHeader.startsWith("Bearer ");

        // Ensure token exists on any first request to a protected path
        String existingToken = readCookie(request, CSRF_COOKIE);
        if (existingToken == null) {
            existingToken = generateToken();
            writeCookie(response, CSRF_COOKIE, existingToken, false); // JS-readable so FE can echo it
            response.setHeader(CSRF_HEADER, existingToken);
        } else {
            // Always echo the current token back so the FE can capture it on first load
            response.setHeader(CSRF_HEADER, existingToken);
        }

        // For state-changing methods on protected paths, validate
        if (!SAFE_METHODS.contains(method.toUpperCase()) && isProtectedPath(path) && !isBearerAuth) {
            String headerToken = request.getHeader(CSRF_HEADER);
            if (headerToken == null || headerToken.isBlank() || !constantTimeEquals(headerToken, existingToken)) {
                log.warn("CSRF validation failed for path={} method={}", path, method);
                sendCsrfError(response, "CSRF token missing or invalid");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isProtectedPath(String path) {
        return PROTECTED_PREFIXES.stream().anyMatch(path::contains);
    }

    private String readCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (jakarta.servlet.http.Cookie c : request.getCookies()) {
            if (name.equals(c.getName())) {
                return c.getValue();
            }
        }
        return null;
    }

    private void writeCookie(HttpServletResponse response, String name, String value, boolean httpOnly) {
        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie(name, value);
        cookie.setHttpOnly(httpOnly);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(COOKIE_MAX_AGE);
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    private String generateToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        byte[] ab = a.getBytes();
        byte[] bb = b.getBytes();
        if (ab.length != bb.length) return false;
        int diff = 0;
        for (int i = 0; i < ab.length; i++) {
            diff |= ab[i] ^ bb[i];
        }
        return diff == 0;
    }

    private void sendCsrfError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        Map<String, Object> body = Map.of(
                "success", false,
                "error", Map.of(
                        "code", 1002,
                        "message", message,
                        "timestamp", LocalDateTime.now().toString()
                )
        );
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
