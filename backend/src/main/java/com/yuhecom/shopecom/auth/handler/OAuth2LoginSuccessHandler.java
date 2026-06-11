package com.yuhecom.shopecom.auth.handler;

import com.yuhecom.shopecom.auth.config.JWTTokenHelper;
import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.service.OAuth2Service;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final OAuth2Service oAuth2Service;
    private final JWTTokenHelper jwtTokenHelper;

    @Value("${app.oauth2.redirect-uri}")
    private String redirectUri;

    private static final int COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        if (email == null || email.isBlank()) {
            log.warn("OAuth2 login: email not provided by provider");
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Email not provided by OAuth2 provider");
            return;
        }

        User user = oAuth2Service.createOrUpdateUser(oAuth2User, "google");
        log.info("OAuth2 login success for user: {}", email);

        String accessToken = jwtTokenHelper.generateToken(user);
        String refreshToken = jwtTokenHelper.generateRefreshToken(user);

        addHttpOnlyCookie(response, "accessToken", accessToken, COOKIE_MAX_AGE, request);
        addHttpOnlyCookie(response, "refreshToken", refreshToken, COOKIE_MAX_AGE, request);

        response.sendRedirect(redirectUri);
    }

    private void addHttpOnlyCookie(HttpServletResponse response, String name, String value, int maxAge, HttpServletRequest request) {
        String encoded = URLEncoder.encode(value, StandardCharsets.UTF_8);
        Cookie cookie = new Cookie(name, encoded);
        cookie.setHttpOnly(true);
        boolean isLocal = isLocalHost(request.getServerName());
        cookie.setSecure(!isLocal);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        cookie.setAttribute("SameSite", isLocal ? "Lax" : "None");
        response.addCookie(cookie);
    }

    private boolean isLocalHost(String serverName) {
        return "localhost".equalsIgnoreCase(serverName)
            || "127.0.0.1".equalsIgnoreCase(serverName)
            || serverName.startsWith("192.168.")
            || serverName.startsWith("10.");
    }
}
