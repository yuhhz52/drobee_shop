package com.yuhecom.shopecom.exception;

/**
 * Marker subtype for expected business-rule failures (e.g. stock conflict,
 * coupon expired, ownership mismatch). HTTP-independent; the global
 * exception handler owns translation to HTTP responses.
 */
public class BusinessException extends AppException {

    public BusinessException(ErrorCode errorCode) {
        super(errorCode);
    }

    public BusinessException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }

    public BusinessException(ErrorCode errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
}
