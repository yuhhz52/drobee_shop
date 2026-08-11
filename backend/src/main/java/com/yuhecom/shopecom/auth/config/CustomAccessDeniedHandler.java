package com.yuhecom.shopecom.auth.config;

import com.yuhecom.shopecom.exception.ErrorCode;
import com.yuhecom.shopecom.exception.ProblemDetailFactory;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;

/**
 * RFC 9457 403 handler for {@link AccessDeniedException} raised inside the
 * security filter chain (e.g. {@code @PreAuthorize} deny). Produces the same
 * body shape as {@link CustomAuthenticationEntryPoint}.
 */
@Component
@Slf4j
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException ex) throws IOException {
        String uri = request.getRequestURI();
        log.warn("Access denied for {}", uri);
        ProblemDetail pd = ProblemDetailFactory.of(ErrorCode.FORBIDDEN,
                ErrorCode.FORBIDDEN.getDefaultMessage());
        if (uri != null) {
            pd.setInstance(URI.create(uri));
        }
        CustomAuthenticationEntryPoint.writeProblem(response, pd);
    }
}