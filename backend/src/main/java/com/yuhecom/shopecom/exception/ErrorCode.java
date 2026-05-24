package com.yuhecom.shopecom.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    UNCATEGORIZED(1000, "uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHORIZED(1001, "unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(1002, "forbidden", HttpStatus.FORBIDDEN),
    NOT_FOUND(1003, "resource not found", HttpStatus.NOT_FOUND),
    BAD_REQUEST(1004, "bad request", HttpStatus.BAD_REQUEST),

    PRINCIPAL_REQUIRED(1005, "principal is required", HttpStatus.UNAUTHORIZED),
    USER_NOT_FOUND(1006, "user not found", HttpStatus.NOT_FOUND),
    JWT_TOKEN_MISSING(1007, "jwt token is missing", HttpStatus.UNAUTHORIZED),
    JWT_TOKEN_INVALID(1008, "jwt token is invalid", HttpStatus.UNAUTHORIZED),
    PAYMENT_INTENT_INVALID(1009, "payment intent invalid", HttpStatus.BAD_REQUEST),
    ORDER_INFO_INVALID(1010, "order info invalid", HttpStatus.BAD_REQUEST),

    ORDER_NOT_FOUND(2001, "order not found", HttpStatus.NOT_FOUND),
    ADDRESS_NOT_FOUND(2002, "address not found", HttpStatus.NOT_FOUND),
    OUT_OF_STOCK(2003, "out of stock", HttpStatus.BAD_REQUEST),
    PRODUCT_NOT_FOUND(2004, "product not found", HttpStatus.NOT_FOUND),
    PRODUCT_VARIANT_NOT_FOUND(2005, "product variant not found", HttpStatus.NOT_FOUND),
    CATEGORY_NOT_FOUND(2006, "category not found", HttpStatus.NOT_FOUND),
    CATEGORY_TYPE_NOT_FOUND(2007, "category type not found", HttpStatus.NOT_FOUND);

    private final int code;
    private final String message;
    private final HttpStatus status;

    ErrorCode(int code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
