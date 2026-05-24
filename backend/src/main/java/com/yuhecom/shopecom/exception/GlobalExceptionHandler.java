package com.yuhecom.shopecom.exception;

import com.yuhecom.shopecom.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<?>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        ApiResponse<?> body = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(ex.getMessage())
                .errorCode(errorCode.name())
                .result(null)
                .build();
        return ResponseEntity.status(errorCode.getStatus()).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleUnhandled(Exception ex) {
        ApiResponse<?> body = ApiResponse.builder()
                .code(ErrorCode.UNCATEGORIZED.getCode())
                .message(ErrorCode.UNCATEGORIZED.getMessage())
                .errorCode(ErrorCode.UNCATEGORIZED.name())
                .result(null)
                .build();
        return ResponseEntity.status(ErrorCode.UNCATEGORIZED.getStatus()).body(body);
    }
}

