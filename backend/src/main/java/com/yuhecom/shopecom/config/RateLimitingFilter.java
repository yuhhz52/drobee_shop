package com.yuhecom.shopecom.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple rate limiting filter to prevent brute force attacks.
 * Uses in-memory tracking per IP address.
 * 
 * Limits:
 * - Auth endpoints (login, register): 10 requests per minute
 * - API endpoints: 100 requests per minute
 * - Default: 60 requests per minute
 */
@Component
@Order(1)
@Slf4j
public class RateLimitingFilter implements Filter {

    private static final int AUTH_RATE_LIMIT = 10;
    private static final int API_RATE_LIMIT = 100;
    private static final int DEFAULT_RATE_LIMIT = 60;
    private static final long WINDOW_SIZE_SECONDS = 60;

    private final Map<String, RateLimitEntry> ipRequestMap = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String clientIp = getClientIp(httpRequest);
        String requestUri = httpRequest.getRequestURI();

        int limit = getRateLimit(requestUri);
        boolean allowed = checkRateLimit(clientIp, limit);

        if (!allowed) {
            log.warn("Rate limit exceeded for IP: {} on URI: {}", clientIp, requestUri);
            httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write(
                "{\"error\":\"Too many requests. Please try again later.\",\"retryAfter\":60}");
            return;
        }

        chain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    private int getRateLimit(String requestUri) {
        if (requestUri.contains("/auth/login") || requestUri.contains("/auth/register")) {
            return AUTH_RATE_LIMIT;
        }
        if (requestUri.startsWith("/api/")) {
            return API_RATE_LIMIT;
        }
        return DEFAULT_RATE_LIMIT;
    }

    private boolean checkRateLimit(String clientIp, int limit) {
        long currentTime = Instant.now().getEpochSecond();

        ipRequestMap.compute(clientIp, (key, entry) -> {
            if (entry == null || currentTime - entry.windowStart >= WINDOW_SIZE_SECONDS) {
                return new RateLimitEntry(currentTime, new AtomicInteger(1));
            }
            entry.count.incrementAndGet();
            return entry;
        });

        RateLimitEntry entry = ipRequestMap.get(clientIp);
        return entry != null && entry.count.get() <= limit;
    }

    @Override
    public void init(FilterConfig filterConfig) {
        log.info("RateLimitingFilter initialized");
    }

    @Override
    public void destroy() {
        ipRequestMap.clear();
    }

    private static class RateLimitEntry {
        final long windowStart;
        final AtomicInteger count;

        RateLimitEntry(long windowStart, AtomicInteger count) {
            this.windowStart = windowStart;
            this.count = count;
        }
    }
}
