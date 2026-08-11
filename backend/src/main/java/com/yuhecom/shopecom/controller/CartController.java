package com.yuhecom.shopecom.controller;

import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.dto.ApiResponse;
import com.yuhecom.shopecom.dto.CartItemRequest;
import com.yuhecom.shopecom.dto.CartResponse;
import com.yuhecom.shopecom.dto.UpdateQuantityRequest;
import com.yuhecom.shopecom.exception.AppException;
import com.yuhecom.shopecom.exception.ErrorCode;
import com.yuhecom.shopecom.service.CartService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Slf4j
public class CartController {

    private final CartService cartService;

    private static final String SESSION_COOKIE = "cart_session";
    private static final int SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

    // ── Read ───────────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<CartResponse> getCart(HttpServletRequest request) {
        User user = getCurrentUser();
        String sessionId = getSessionId(request);
        return ResponseEntity.ok(cartService.getCart(user, sessionId));
    }

    // ── Write ─────────────────────────────────────────────────────────────────

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(
            @Valid @RequestBody CartItemRequest itemRequest,
            HttpServletRequest request,
            HttpServletResponse response) {

        User user = getCurrentUser();
        String sessionId = getOrCreateSessionId(request, response);

        log.info("Add to cart: user={}, session={}, product={}, variant={}, qty={}",
                user != null ? user.getEmail() : "anonymous",
                maskSessionId(sessionId),
                itemRequest.getProductId(),
                itemRequest.getVariantId(),
                itemRequest.getQuantity());

        return ResponseEntity.ok(cartService.addItem(user, sessionId, itemRequest));
    }

    @PatchMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateQuantity(
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateQuantityRequest body,
            HttpServletRequest request) {

        User user = getCurrentUser();
        String sessionId = getSessionId(request);
        requireSessionOrAuth(user, sessionId);

        log.info("Update cart item: itemId={}, qty={}, user={}", itemId, body.getQuantity(),
                user != null ? user.getEmail() : maskSessionId(sessionId));
        return ResponseEntity.ok(cartService.updateItemQuantity(user, sessionId, itemId, body.getQuantity()));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(
            @PathVariable UUID itemId,
            HttpServletRequest request) {

        User user = getCurrentUser();
        String sessionId = getSessionId(request);
        requireSessionOrAuth(user, sessionId);

        log.info("Remove cart item: itemId={}, user={}", itemId,
                user != null ? user.getEmail() : maskSessionId(sessionId));
        return ResponseEntity.ok(cartService.removeItem(user, sessionId, itemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(HttpServletRequest request) {
        User user = getCurrentUser();
        String sessionId = getSessionId(request);

        if (user == null && (sessionId == null || sessionId.isBlank())) {
            return ResponseEntity.ok().build();
        }

        log.info("Clear cart: user={}",
                user != null ? user.getEmail() : maskSessionId(sessionId));
        cartService.clearCart(user, sessionId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/merge")
    public ResponseEntity<CartResponse> mergeCart(HttpServletRequest request) {
        User user = getCurrentUser();
        if (user == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED,
                    "Authentication required to merge carts");
        }

        String sessionId = getSessionId(request);
        log.info("Merge cart: user={}, session={}", user.getEmail(), maskSessionId(sessionId));

        return ResponseEntity.ok(cartService.mergeAnonymousCart(user, sessionId));
    }

    /**
     * Validate cart for checkout - returns the current cart with availability flags.
     */
    @GetMapping("/validate-checkout")
    public ResponseEntity<?> validateCheckout(HttpServletRequest request) {
        User user = getCurrentUser();
        if (user == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED,
                    "Authentication required for checkout validation");
        }

        String sessionId = getSessionId(request);
        CartResponse cart = cartService.getCart(user, sessionId);

        if (cart.getItems().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                    .message("Cart is empty").build());
        }

        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .result(cart).message("Cart retrieved successfully").build());
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void requireSessionOrAuth(User user, String sessionId) {
        if (user == null && (sessionId == null || sessionId.isBlank())) {
            throw new AppException(ErrorCode.UNAUTHORIZED,
                    "Authentication or session cookie is required");
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null
                && auth.isAuthenticated()
                && !"anonymousUser".equals(auth.getPrincipal())
                && auth.getPrincipal() instanceof User user) {
            return user;
        }
        return null;
    }

    /**
     * Extracts cart session ID ONLY from HttpOnly cookie set by the server.
     */
    private String getSessionId(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if (SESSION_COOKIE.equals(c.getName())) {
                    return c.getValue();
                }
            }
        }
        return null;
    }

    private String getOrCreateSessionId(HttpServletRequest request, HttpServletResponse response) {
        String existing = getSessionId(request);
        if (existing != null && !existing.isBlank()) {
            return existing;
        }

        String newSessionId = UUID.randomUUID().toString();
        Cookie cookie = new Cookie(SESSION_COOKIE, newSessionId);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(SESSION_MAX_AGE);
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);

        return newSessionId;
    }

    private String maskSessionId(String sessionId) {
        if (sessionId == null || sessionId.length() < 8) return "***";
        return sessionId.substring(0, 8) + "***";
    }
}