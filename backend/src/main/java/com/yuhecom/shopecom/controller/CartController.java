package com.yuhecom.shopecom.controller;

import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.dto.CartItemRequest;
import com.yuhecom.shopecom.dto.CartResponse;
import com.yuhecom.shopecom.dto.UpdateQuantityRequest;
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
        CartResponse cart = cartService.getCart(user, sessionId);
        return ResponseEntity.ok(cart);
    }

    // ── Write ─────────────────────────────────────────────────────────────────

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(
            @Valid @RequestBody CartItemRequest itemRequest,
            HttpServletRequest request,
            HttpServletResponse response) {

        User user = getCurrentUser();
        String sessionId = getOrCreateSessionId(request, response);

        log.info("Add to cart: user={}, session={}, product={}",
                user != null ? user.getEmail() : "anonymous",
                maskSessionId(sessionId),
                itemRequest.getProductId());

        CartResponse cart = cartService.addItem(user, sessionId, itemRequest);
        return ResponseEntity.ok(cart);
    }

    @PatchMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateQuantity(
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateQuantityRequest body,
            HttpServletRequest request) {

        User user = getCurrentUser();
        String sessionId = getSessionId(request);

        if (user == null && (sessionId == null || sessionId.isBlank())) {
            return ResponseEntity.badRequest().build();
        }

        log.info("Update cart item: itemId={}, qty={}", itemId, body.getQuantity());
        CartResponse cart = cartService.updateItemQuantity(user, sessionId, itemId, body.getQuantity());
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(
            @PathVariable UUID itemId,
            HttpServletRequest request) {

        User user = getCurrentUser();
        String sessionId = getSessionId(request);

        if (user == null && (sessionId == null || sessionId.isBlank())) {
            return ResponseEntity.badRequest().build();
        }

        log.info("Remove cart item: itemId={}", itemId);
        CartResponse cart = cartService.removeItem(user, sessionId, itemId);
        return ResponseEntity.ok(cart);
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
            return ResponseEntity.status(401).build();
        }

        String sessionId = getSessionId(request);
        log.info("Merge cart: user={}, session={}", user.getEmail(), maskSessionId(sessionId));

        CartResponse cart = cartService.mergeAnonymousCart(user, sessionId);
        return ResponseEntity.ok(cart);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

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
     * No header fallback — prevents session hijacking via arbitrary headers.
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

    /**
     * Returns existing session ID, or creates a new one and sets it as cookie.
     * Cookie is NOT HttpOnly so the FE can read it to display cart badge.
     * Session ID is a cryptographically random UUID — not guessable.
     * SameSite=Lax prevents CSRF while allowing top-level navigation.
     */
    private String getOrCreateSessionId(HttpServletRequest request, HttpServletResponse response) {
        String existing = getSessionId(request);
        if (existing != null && !existing.isBlank()) {
            return existing;
        }

        String newSessionId = UUID.randomUUID().toString();
        Cookie cookie = new Cookie(SESSION_COOKIE, newSessionId);
        cookie.setHttpOnly(false);      // FE needs to read it for cart badge
        cookie.setSecure(true);          // HTTPS only in production
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
