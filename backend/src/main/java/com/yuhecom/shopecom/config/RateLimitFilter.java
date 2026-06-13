package com.yuhecom.shopecom.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yuhecom.shopecom.auth.config.JWTTokenHelper;
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
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;
    private final JWTTokenHelper jwtTokenHelper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Set<String> LOGIN_PATHS = Set.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/forgot-password"
    );

    private static final Set<String> CHECKOUT_PATHS = Set.of(
            "/api/orders/checkout",
            "/api/orders/create"
    );

    private static final Set<String> CART_PATHS = Set.of(
            "/api/cart/items",
            "/api/cart/add"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String clientIp = getClientIp(request);

        if (isLoginPath(path)) {
            if (!rateLimitService.tryConsumeLogin(clientIp)) {
                sendRateLimitResponse(response, "Too many login attempts. Please try again later.");
                return;
            }
        } else if (isCheckoutPath(path)) {
            String key = resolveKeyForCheckout(request, clientIp);
            if (key != null && !rateLimitService.tryConsumeCheckout(key)) {
                sendRateLimitResponse(response, "Too many checkout attempts. Please slow down.");
                return;
            }
        } else if (isCartPath(path)) {
            String key = resolveKeyForCart(request, clientIp);
            if (!rateLimitService.tryConsumeCart(key)) {
                sendRateLimitResponse(response, "Too many cart operations. Please slow down.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isLoginPath(String path) {
        return LOGIN_PATHS.stream().anyMatch(path::contains);
    }

    private boolean isCheckoutPath(String path) {
        return CHECKOUT_PATHS.stream().anyMatch(path::contains);
    }

    private boolean isCartPath(String path) {
        return CART_PATHS.stream().anyMatch(path::contains);
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

    /**
     * For checkout, prefer user identity from JWT (so 10/min is per user),
     * but fall back to IP for anonymous traffic. Returning null means
     * the filter will skip the check for this request.
     */
    private String resolveKeyForCheckout(HttpServletRequest request, String clientIp) {
        String username = getUsernameFromJwt(request);
        return username != null ? "u:" + username : "ip:" + clientIp;
    }

    /**
     * For cart operations, prefer user identity when authenticated,
     * else use IP. Cart limit is global per identity (60/min).
     */
    private String resolveKeyForCart(HttpServletRequest request, String clientIp) {
        String username = getUsernameFromJwt(request);
        return username != null ? "u:" + username : "ip:" + clientIp;
    }

    private String getUsernameFromJwt(HttpServletRequest request) {
        try {
            String token = jwtTokenHelper.getToken(request);
            if (token == null) {
                return null;
            }
            return jwtTokenHelper.getUserNameFromToken(token);
        } catch (Exception e) {
            // Invalid/expired token — treat as anonymous, fall back to IP-based limiting
            return null;
        }
    }

    private void sendRateLimitResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> errorResponse = Map.of(
                "success", false,
                "error", Map.of(
                        "code", 1002,
                        "message", message,
                        "timestamp", LocalDateTime.now().toString()
                )
        );

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
