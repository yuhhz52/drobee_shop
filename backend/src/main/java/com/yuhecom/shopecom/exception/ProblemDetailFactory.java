package com.yuhecom.shopecom.exception;

import com.yuhecom.shopecom.dto.ValidationErrorEntry;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.net.URI;
import java.util.List;

/**
 * Builds RFC 9457 {@link ProblemDetail} bodies from application
 * {@link ErrorCode}s. Adds the project's two extension members:
 * <ul>
 *   <li>{@code errorCode} — string slug (the {@link ErrorCode} name)</li>
 *   <li>{@code appCode}   — stable numeric application error code</li>
 *   <li>{@code errors}    — optional list of {@link ValidationErrorEntry}</li>
 * </ul>
 *
 * <p>RFC 9457 fields ({@code type}, {@code title}, {@code status},
 * {@code detail}, {@code instance}) are set from the {@link ErrorCode} and
 * the current request URI. No HTTP / servlet types leak into domain code
 * — the request URI is read from {@link RequestContextHolder}.
 */
public final class ProblemDetailFactory {

    private static final String PROBLEM_BASE = "https://api.shopecom.example.com/problems/";

    private ProblemDetailFactory() {
    }

    public static ProblemDetail of(ErrorCode code, String detail) {
        return of(code, detail, null);
    }

    public static ProblemDetail of(ErrorCode code, String detail, List<ValidationErrorEntry> errors) {
        HttpStatus status = code.getStatus();
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(status, detail);
        pd.setType(buildTypeUri(code));
        pd.setTitle(humanize(code.name()));
        String instanceUri = currentRequestUri();
        if (instanceUri != null) {
            pd.setInstance(URI.create(instanceUri));
        }

        pd.setProperty("errorCode", code.name());
        pd.setProperty("appCode", code.getAppCode());
        if (errors != null && !errors.isEmpty()) {
            pd.setProperty("errors", errors);
        }
        return pd;
    }

    private static URI buildTypeUri(ErrorCode code) {
        String slug = code.name().toLowerCase().replace('_', '-');
        return URI.create(PROBLEM_BASE + slug);
    }

    private static String humanize(String enumName) {
        StringBuilder sb = new StringBuilder(enumName.length());
        boolean capitalizeNext = true;
        for (int i = 0; i < enumName.length(); i++) {
            char c = enumName.charAt(i);
            if (c == '_') {
                sb.append(' ');
                capitalizeNext = true;
            } else if (capitalizeNext) {
                sb.append(Character.toUpperCase(c));
                capitalizeNext = false;
            } else {
                sb.append(Character.toLowerCase(c));
            }
        }
        return sb.toString();
    }

    private static String currentRequestUri() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes)
                    RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest req = attrs.getRequest();
                String uri = req.getRequestURI();
                if (uri != null) {
                    return uri;
                }
            }
        } catch (IllegalStateException ignored) {
            // no request bound
        }
        return null;
    }
}
