package com.yuhecom.shopecom.dto;

import lombok.*;

/**
 * Success-only response wrapper. Error responses are emitted by
 * {@code GlobalExceptionHandler} as RFC 9457 {@code ProblemDetail}
 * (not as {@code ApiResponse}).
 *
 * <p>Field name {@code result} is preserved for backward compatibility with
 * existing clients; it carries the operation's payload.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
    @Builder.Default
    private String message = "success";
    private T result;
}