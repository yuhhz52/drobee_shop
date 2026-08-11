package com.yuhecom.shopecom.exception;

import org.springframework.http.HttpStatus;

/**
 * Application error semantics.
 *
 * <p>Each enum constant carries:
 * <ul>
 *   <li>{@code appCode} — stable application error code (numeric, for API clients).
 *       This is NOT an HTTP status code.</li>
 *   <li>{@code defaultMessage} — human-readable default message; can be overridden at throw site.</li>
 *   <li>{@code status} — HTTP status to be used by the global exception handler.</li>
 * </ul>
 */
public enum ErrorCode {
    UNCATEGORIZED(1000, "An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHORIZED(1001, "Authentication is required", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(1002, "Access is forbidden", HttpStatus.FORBIDDEN),
    NOT_FOUND(1003, "Resource not found", HttpStatus.NOT_FOUND),
    BAD_REQUEST(1004, "Malformed request", HttpStatus.BAD_REQUEST),
    VALIDATION_ERROR(1005, "One or more fields are invalid", HttpStatus.BAD_REQUEST),
    MALFORMED_REQUEST(1006, "Request body could not be parsed", HttpStatus.BAD_REQUEST),
    DATA_CONFLICT(1007, "Data conflict", HttpStatus.CONFLICT),
    FILE_TOO_LARGE(1008, "Uploaded file is too large", HttpStatus.PAYLOAD_TOO_LARGE),
    FILE_UPLOAD_FAILED(1009, "Upload failed. Please check image size and format", HttpStatus.BAD_REQUEST),
    DIRECTORY_TRAVERSAL_BLOCKED(1010, "Invalid file path", HttpStatus.FORBIDDEN),
    INTERNAL_CRYPTO_ERROR(1011, "Internal payment signing error", HttpStatus.INTERNAL_SERVER_ERROR),

    PRINCIPAL_REQUIRED(1100, "Principal is required", HttpStatus.UNAUTHORIZED),
    USER_NOT_FOUND(1101, "User not found", HttpStatus.NOT_FOUND),
    JWT_TOKEN_MISSING(1102, "Authentication token is missing", HttpStatus.UNAUTHORIZED),
    JWT_TOKEN_INVALID(1103, "Authentication token is invalid or expired", HttpStatus.UNAUTHORIZED),
    PAYMENT_INTENT_INVALID(1103, "Payment intent is invalid", HttpStatus.BAD_REQUEST),
    ORDER_INFO_INVALID(1104, "Order info is invalid", HttpStatus.BAD_REQUEST),

    ORDER_NOT_FOUND(2001, "Order not found", HttpStatus.NOT_FOUND),
    ADDRESS_NOT_FOUND(2002, "Address not found", HttpStatus.NOT_FOUND),
    OUT_OF_STOCK(2003, "Item is out of stock", HttpStatus.CONFLICT),
    INSUFFICIENT_STOCK(2004, "Insufficient stock for this item", HttpStatus.CONFLICT),
    PRODUCT_NOT_FOUND(2005, "Product not found", HttpStatus.NOT_FOUND),
    PRODUCT_VARIANT_NOT_FOUND(2006, "Product variant not found", HttpStatus.NOT_FOUND),
    VARIANT_NOT_FOUND(2007, "Variant not found", HttpStatus.NOT_FOUND),
    VARIANT_INACTIVE(2008, "Variant is not available", HttpStatus.CONFLICT),
    CATEGORY_NOT_FOUND(2009, "Category not found", HttpStatus.NOT_FOUND),
    CATEGORY_TYPE_NOT_FOUND(2010, "Category type not found", HttpStatus.NOT_FOUND),
    CART_NOT_FOUND(2011, "Cart not found", HttpStatus.NOT_FOUND),
    CART_EMPTY(2012, "Cart is empty", HttpStatus.BAD_REQUEST),
    CART_ITEM_UNAVAILABLE(2013, "Cart item is no longer available", HttpStatus.CONFLICT),
    BUY_NOW_PAYLOAD_INVALID(2014, "Buy-now checkout payload is missing or invalid", HttpStatus.BAD_REQUEST),
    CHECKOUT_PAYMENT_METHOD_INVALID(2015, "Payment method is not supported for this checkout flow", HttpStatus.BAD_REQUEST),
    CHECKOUT_QUANTITY_INVALID(2016, "Quantity must be greater than zero", HttpStatus.BAD_REQUEST),

    PAYMENT_FAILED(4001, "Payment failed", HttpStatus.CONFLICT),
    PAYMENT_TIMEOUT(4002, "Payment timed out", HttpStatus.REQUEST_TIMEOUT),
    ORDER_ABANDONED(4003, "Order abandoned - payment not completed", HttpStatus.GONE),

    DUPLICATE_REQUEST(3001, "Duplicate request detected", HttpStatus.CONFLICT),

    COUPON_NOT_FOUND(5001, "Coupon not found", HttpStatus.NOT_FOUND),
    COUPON_INACTIVE(5002, "Coupon is inactive", HttpStatus.CONFLICT),
    COUPON_EXPIRED(5003, "Coupon has expired", HttpStatus.CONFLICT),
    COUPON_NOT_YET_VALID(5004, "Coupon is not yet valid", HttpStatus.CONFLICT),
    COUPON_USAGE_LIMIT_REACHED(5005, "Coupon usage limit reached", HttpStatus.CONFLICT),
    COUPON_MIN_ORDER_NOT_MET(5006, "Minimum order amount not met", HttpStatus.UNPROCESSABLE_ENTITY);

    private final int appCode;
    private final String defaultMessage;
    private final HttpStatus status;

    ErrorCode(int appCode, String defaultMessage, HttpStatus status) {
        this.appCode = appCode;
        this.defaultMessage = defaultMessage;
        this.status = status;
    }

    /** Stable application error code (NOT an HTTP status). */
    public int getAppCode() {
        return appCode;
    }

    /** Human-readable default message; can be overridden at the throw site. */
    public String getDefaultMessage() {
        return defaultMessage;
    }

    /** HTTP status the global exception handler should return. */
    public HttpStatus getStatus() {
        return status;
    }
}
