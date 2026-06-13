package com.yuhecom.shopecom.controller;

import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.dto.ApiResponse;
import com.yuhecom.shopecom.dto.CartCheckoutValidation;
import com.yuhecom.shopecom.dto.CartItemRequest;
import com.yuhecom.shopecom.dto.CartResponse;
import com.yuhecom.shopecom.dto.UpdateQuantityRequest;
import com.yuhecom.shopecom.exception.AppException;
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
    public ResponseEntity<?> getCart(HttpServletRequest request) {
        try {
            User user = getCurrentUser();
            String sessionId = getSessionId(request);
            CartResponse cart = cartService.getCart(user, sessionId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            log.error("Error getting cart: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.builder()
                            .code(500)
                            .message("Failed to load cart: " + e.getMessage())
                            .errorCode("CART_LOAD_ERROR")
                            .result(null)
                            .build());
        }
    }

    // ── Write ─────────────────────────────────────────────────────────────────

    @PostMapping("/items")
    public ResponseEntity<?> addItem(
            @Valid @RequestBody CartItemRequest itemRequest,
            HttpServletRequest request,
            HttpServletResponse response) {

        try {
            User user = getCurrentUser();
            String sessionId = getOrCreateSessionId(request, response);

            log.info("Add to cart: user={}, session={}, product={}, variant={}, qty={}",
                    user != null ? user.getEmail() : "anonymous",
                    maskSessionId(sessionId),
                    itemRequest.getProductId(),
                    itemRequest.getVariantId(),
                    itemRequest.getQuantity());

            CartResponse cart = cartService.addItem(user, sessionId, itemRequest);
            return ResponseEntity.ok(cart);
        } catch (AppException e) {
            log.warn("Add to cart failed: {}", e.getMessage());
            return ResponseEntity.status(e.getErrorCode().getStatus())
                    .body(com.yuhecom.shopecom.dto.ApiResponse.builder()
                            .code(e.getErrorCode().getCode())
                            .message(e.getMessage())
                            .errorCode(e.getErrorCode().name())
                            .result(null)
                            .build());
        }
    }

    @PatchMapping("/items/{itemId}")
    public ResponseEntity<?> updateQuantity(
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateQuantityRequest body,
            HttpServletRequest request) {

        try {
            User user = getCurrentUser();
            String sessionId = getSessionId(request);

            if (user == null && (sessionId == null || sessionId.isBlank())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.builder()
                                .code(400)
                                .message("Authentication required")
                                .errorCode("UNAUTHORIZED")
                                .build());
            }

            log.info("Update cart item: itemId={}, qty={}, user={}", itemId, body.getQuantity(),
                    user != null ? user.getEmail() : maskSessionId(sessionId));
            CartResponse cart = cartService.updateItemQuantity(user, sessionId, itemId, body.getQuantity());
            return ResponseEntity.ok(cart);
        } catch (AppException e) {
            log.warn("Update cart item failed: {}", e.getMessage());
            return ResponseEntity.status(e.getErrorCode().getStatus())
                    .body(ApiResponse.builder()
                            .code(e.getErrorCode().getCode())
                            .message(e.getMessage())
                            .errorCode(e.getErrorCode().name())
                            .build());
        } catch (Exception e) {
            log.error("Unexpected error updating cart item: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.builder()
                            .code(500)
                            .message("Failed to update cart item")
                            .errorCode("CART_UPDATE_ERROR")
                            .build());
        }
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> removeItem(
            @PathVariable UUID itemId,
            HttpServletRequest request) {

        try {
            User user = getCurrentUser();
            String sessionId = getSessionId(request);

            if (user == null && (sessionId == null || sessionId.isBlank())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.builder()
                                .code(400)
                                .message("Authentication required")
                                .errorCode("UNAUTHORIZED")
                                .build());
            }

            log.info("Remove cart item: itemId={}, user={}", itemId,
                    user != null ? user.getEmail() : maskSessionId(sessionId));
            CartResponse cart = cartService.removeItem(user, sessionId, itemId);
            return ResponseEntity.ok(cart);
        } catch (AppException e) {
            log.warn("Remove cart item failed: {}", e.getMessage());
            return ResponseEntity.status(e.getErrorCode().getStatus())
                    .body(ApiResponse.builder()
                            .code(e.getErrorCode().getCode())
                            .message(e.getMessage())
                            .errorCode(e.getErrorCode().name())
                            .build());
        } catch (Exception e) {
            log.error("Unexpected error removing cart item: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.builder()
                            .code(500)
                            .message("Failed to remove cart item")
                            .errorCode("CART_REMOVE_ERROR")
                            .build());
        }
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

    /**
     * Validate cart for checkout - returns detailed stock and availability status.
     * Should be called before checkout to show users which items have issues.
     */
    @GetMapping("/validate-checkout")
    public ResponseEntity<?> validateCheckout(HttpServletRequest request) {
        try {
            User user = getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(401)
                        .body(ApiResponse.builder()
                                .code(401)
                                .message("Authentication required")
                                .errorCode("UNAUTHORIZED")
                                .build());
            }

            String sessionId = getSessionId(request);
            CartResponse cartResponse = cartService.getCart(user, sessionId);

            if (cartResponse.getItems().isEmpty()) {
                return ResponseEntity.ok(ApiResponse.<CartCheckoutValidation>builder()
                        .result(null)
                        .message("Cart is empty")
                        .build());
            }

            // Get full cart entity for validation
            CartResponse fullCart = cartService.getCart(user, sessionId);
            return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                    .result(fullCart)
                    .message("Cart retrieved successfully")
                    .build());

        } catch (AppException e) {
            return ResponseEntity.status(e.getErrorCode().getStatus())
                    .body(ApiResponse.builder()
                            .code(e.getErrorCode().getCode())
                            .message(e.getMessage())
                            .errorCode(e.getErrorCode().name())
                            .build());
        } catch (Exception e) {
            log.error("Error validating cart: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.builder()
                            .code(500)
                            .message("Failed to validate cart")
                            .errorCode("CART_VALIDATION_ERROR")
                            .build());
        }
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
     * Cookie IS HttpOnly so it cannot be read by JavaScript — preventing XSS-based
     * session theft. The server is the only party that needs the sessionId; the FE
     * should not display the raw UUID to users. The cart response payload includes
     * a non-sensitive cart count the FE can use for badges.
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
        cookie.setHttpOnly(true);          // XSS-safe: JS cannot read this cookie
        cookie.setSecure(true);            // HTTPS only in production
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
