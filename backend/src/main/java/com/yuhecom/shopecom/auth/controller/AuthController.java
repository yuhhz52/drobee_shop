package com.yuhecom.shopecom.auth.controller;

import com.yuhecom.shopecom.auth.config.JWTTokenHelper;
import com.yuhecom.shopecom.auth.dto.LoginRequest;
import com.yuhecom.shopecom.auth.dto.RegistrationRequest;
import com.yuhecom.shopecom.auth.dto.RegistrationResponse;
import com.yuhecom.shopecom.auth.dto.UserToken;
import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.repository.UsersRepository;
import com.yuhecom.shopecom.auth.service.RegistrationService;
import com.yuhecom.shopecom.auth.service.TokenBlacklistService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final RegistrationService registrationService;
    private final UserDetailsService userDetailsService;
    private final JWTTokenHelper jwtTokenHelper;
    private final TokenBlacklistService tokenBlacklistService;
    private final UsersRepository userRepository;

    /**
     * Login: trả access token + refresh token về body (FE tự lưu).
     * Có thể mở rộng set refresh token vào HTTP-Only cookie (như OAuth2).
     */
    @PostMapping("/login")
    public ResponseEntity<UserToken> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for: {}", request.getUserName());

        try {
            Authentication auth = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(request.getUserName(), request.getPassword())
            );

            if (!auth.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            User user = (User) auth.getPrincipal();
            if (!user.isEnabled()) {
                log.warn("Login rejected — account disabled: {}", request.getUserName());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            String accessToken = jwtTokenHelper.generateToken(user);
            String refreshToken = jwtTokenHelper.generateRefreshToken(user);

            log.info("Login success: {}", request.getUserName());
            return ResponseEntity.ok(UserToken.builder()
                    .token(accessToken)
                    .refreshToken(refreshToken)
                    .build());

        } catch (Exception e) {
            log.warn("Login failed for: {}", request.getUserName());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<RegistrationResponse> register(@Valid @RequestBody RegistrationRequest request) {
        RegistrationResponse response = registrationService.createUser(request);
        HttpStatus status = response.getCode() == 200 ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> body) {
        String email = body.get("userName");
        String code = body.get("code");

        if (email == null || code == null) {
            return ResponseEntity.badRequest().body("Missing userName or code");
        }

        return userRepository.findByEmail(email)
                .filter(u -> code.equals(u.getVerificationCode()))
                .map(u -> {
                    registrationService.verifyUser(email);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }

    /**
     * Refresh: refresh token đọc từ HTTP-Only cookie (consistent với OAuth2 flow).
     * FE gọi với option { withCredentials: true }.
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request) {
        String refreshToken = extractRefreshToken(request);
        if (refreshToken == null) {
            return ResponseEntity.badRequest().body("Missing refresh token");
        }

        if (tokenBlacklistService.isRefreshTokenBlacklisted(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token has been revoked");
        }

        try {
            String username = jwtTokenHelper.getUserNameFromToken(refreshToken);
            var userDetails = userDetailsService.loadUserByUsername(username);

            if (!jwtTokenHelper.validateToken(refreshToken, userDetails)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token expired or invalid");
            }

            String newAccessToken = jwtTokenHelper.generateToken((User) userDetails);
            return ResponseEntity.ok(UserToken.builder()
                    .token(newAccessToken)
                    .refreshToken(refreshToken)
                    .build());

        } catch (Exception e) {
            log.warn("Refresh token invalid: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
        }
    }

    /**
     * Logout: revoke refresh token (blacklist).
     * Access token sẽ tự hết hạn — không cần blacklist riêng.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractRefreshToken(request);
        if (refreshToken != null) {
            try {
                var expiry = jwtTokenHelper.getExpirationDate(refreshToken);
                tokenBlacklistService.blacklistRefreshToken(refreshToken, expiry);
            } catch (Exception e) {
                // Token invalid → blacklist với TTL ngắn
                tokenBlacklistService.blacklistRefreshToken(
                        refreshToken,
                        new java.util.Date(System.currentTimeMillis() + 1000)
                );
            }
        }
        // Xoá cookies phía client
        clearCookies(response);
        log.info("Logout processed");
        return ResponseEntity.ok().build();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private String extractRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("refreshToken".equals(c.getName())) return c.getValue();
            }
        }
        return null;
    }

    private void clearCookies(HttpServletResponse response) {
        for (String name : new String[]{"accessToken", "refreshToken"}) {
            Cookie cookie = new Cookie(name, "");
            cookie.setHttpOnly(true);
            cookie.setSecure(true);
            cookie.setPath("/");
            cookie.setMaxAge(0);
            cookie.setAttribute("SameSite", "Lax");
            response.addCookie(cookie);
        }
    }
}
