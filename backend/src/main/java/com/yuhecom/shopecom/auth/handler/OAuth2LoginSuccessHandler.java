package com.yuhecom.shopecom.auth.handler;

import com.yuhecom.shopecom.auth.config.JWTTokenHelper;
import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.service.OAuth2Service;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final OAuth2Service oAuth2Service;
    private final JWTTokenHelper jwtTokenHelper;

    @Value("${app.oauth2.redirect-uri}")
    private String redirectUri;

    @Value("${app.oauth2.cookie-domain:#{null}}")
    private String cookieDomain;

    @Value("${app.oauth2.cookie-samesite:None}")
    private String cookieSameSite;

    @Value("${app.oauth2.cookie-secure:true}")
    private boolean cookieSecure;

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
        log.info("OAuth2 login success for user: {} | redirect to: {}", email, redirectUri);

        String accessToken = jwtTokenHelper.generateToken(user);
        String refreshToken = jwtTokenHelper.generateRefreshToken(user);

        addHttpOnlyCookie(response, "accessToken", accessToken, COOKIE_MAX_AGE, request);
        addHttpOnlyCookie(response, "refreshToken", refreshToken, COOKIE_MAX_AGE, request);

        log.debug("Cookies set — serverName={} redirectUri={}", request.getServerName(), redirectUri);
        response.sendRedirect(redirectUri);
    }

    private void addHttpOnlyCookie(HttpServletResponse response, String name, String value, int maxAge, HttpServletRequest request) {
        String serverName = request.getServerName();
        boolean isHttps = request.getHeader("X-Forwarded-Proto") != null
                && request.getHeader("X-Forwarded-Proto").equalsIgnoreCase("https")
                || request.getServerPort() == 443
                || cookieSecure;

        log.debug("Cookie '{}': serverName={} cookieDomain={} cookieSameSite={} isHttps={}",
                name, serverName, cookieDomain, cookieSameSite, isHttps);

        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(isHttps)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(maxAge);

        if (cookieDomain != null && !cookieDomain.isBlank()) {
            builder.domain(cookieDomain);
            log.debug("Cookie '{}': domain={} sameSite={}", name, cookieDomain, cookieSameSite);
        } else {
            log.debug("Cookie '{}': no domain set (same-site cookie)", name);
        }

        response.addHeader("Set-Cookie", builder.build().toString());
    }
}
