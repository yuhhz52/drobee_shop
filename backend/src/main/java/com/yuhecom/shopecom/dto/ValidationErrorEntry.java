package com.yuhecom.shopecom.dto;

import java.util.List;

/**
 * Per-field validation failure entry. Used inside the ProblemDetail's
 * {@code errors} extension when a request fails {@code @Valid} validation.
 */
public record ValidationErrorEntry(String field, String message) {
    public static ValidationErrorEntry of(String field, String message) {
        return new ValidationErrorEntry(field, message);
    }

    public static List<ValidationErrorEntry> empty() {
        return List.of();
    }
}
