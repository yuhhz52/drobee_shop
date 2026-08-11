package com.yuhecom.shopecom.auth.config;

import com.yuhecom.shopecom.exception.ErrorCode;
import com.yuhecom.shopecom.exception.ProblemDetailFactory;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;

/**
 * RFC 9457 401 entry point. Delegates body construction to
 * {@link ProblemDetailFactory} so security failures share the same
 * JSON shape as every other error response.
 */
@Component
@Slf4j
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        String uri = request.getRequestURI();

        // OAuth2 authorization endpoints must continue to redirect; not a 401.
        if (uri != null
                && (uri.startsWith("/oauth2/authorization/") || uri.startsWith("/login/oauth2/"))) {
            log.debug("OAuth2 authorization request detected: {}", uri);
            response.sendError(HttpServletResponse.SC_FOUND);
            return;
        }

        log.warn("Unauthorized request to {}", uri);
        ProblemDetail pd = ProblemDetailFactory.of(ErrorCode.UNAUTHORIZED,
                ErrorCode.UNAUTHORIZED.getDefaultMessage());
        if (uri != null) {
            pd.setInstance(URI.create(uri));
        }
        writeProblem(response, pd);
    }

    static void writeProblem(HttpServletResponse response, ProblemDetail pd) throws IOException {
        response.setStatus(pd.getStatus());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        String json = "{\"type\":\"" + escape(pd.getType() == null ? "" : pd.getType().toString())
                + "\",\"title\":\"" + escape(pd.getTitle()) + "\",\"status\":" + pd.getStatus()
                + ",\"detail\":\"" + escape(pd.getDetail()) + "\","
                + "\"instance\":\"" + escape(pd.getInstance() == null ? "" : pd.getInstance().toString())
                + "\",\"errorCode\":\"" + escape((String) pd.getProperties().get("errorCode")) + "\","
                + "\"appCode\":" + pd.getProperties().get("appCode") + "}";
        response.getWriter().write(json);
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}