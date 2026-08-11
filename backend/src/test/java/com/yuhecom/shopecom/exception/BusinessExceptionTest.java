package com.yuhecom.shopecom.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;

class BusinessExceptionTest {

    @Test
    void preservesErrorCode_whenConstructedWithEnumOnly() {
        BusinessException ex = new BusinessException(ErrorCode.ORDER_NOT_FOUND);
        assertSame(ErrorCode.ORDER_NOT_FOUND, ex.getErrorCode());
        assertEquals(ErrorCode.ORDER_NOT_FOUND.getDefaultMessage(), ex.getMessage());
    }

    @Test
    void customMessage_overridesDefault() {
        BusinessException ex = new BusinessException(
                ErrorCode.INSUFFICIENT_STOCK, "Only 3 items available");
        assertSame(ErrorCode.INSUFFICIENT_STOCK, ex.getErrorCode());
        assertEquals("Only 3 items available", ex.getMessage());
    }

    @Test
    void causeIsPreserved() {
        IllegalStateException root = new IllegalStateException("boom");
        BusinessException ex = new BusinessException(
                ErrorCode.INTERNAL_CRYPTO_ERROR, "Internal payment signing error", root);
        assertSame(root, ex.getCause());
        assertEquals("Internal payment signing error", ex.getMessage());
    }
}