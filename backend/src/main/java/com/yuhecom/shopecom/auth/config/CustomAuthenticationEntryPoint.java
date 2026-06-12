package com.yuhecom.shopecom.auth.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        String requestUri = request.getRequestURI();

        // Allow OAuth2 authorization endpoints to be handled by Spring Security
        // These should redirect to the OAuth provider, not return 401
        if (requestUri.startsWith("/oauth2/authorization/")
                || requestUri.startsWith("/login/oauth2/")) {
            log.debug("OAuth2 authorization request detected: {}", requestUri);
            response.sendError(HttpServletResponse.SC_FOUND);
            return;
        }

        log.warn("Unauthorized access attempt to: {} - {}", requestUri, authException.getMessage());
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"Unauthorized or Invalid Token\"}");
    }
}