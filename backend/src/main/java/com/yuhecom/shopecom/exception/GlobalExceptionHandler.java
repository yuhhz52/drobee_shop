package com.yuhecom.shopecom.exception;

import com.yuhecom.shopecom.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<?>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        log.warn("Handled AppException. errorCode={}, message={}", errorCode.name(), ex.getMessage());
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
        log.error("Unhandled exception caught: {}", ex.getMessage(), ex);
        ApiResponse<?> body = ApiResponse.builder()
                .code(ErrorCode.UNCATEGORIZED.getCode())
                .message(ErrorCode.UNCATEGORIZED.getMessage())
                .errorCode(ErrorCode.UNCATEGORIZED.name())
                .result(null)
                .build();
        return ResponseEntity.status(ErrorCode.UNCATEGORIZED.getStatus()).body(body);
    }

    @ExceptionHandler({MaxUploadSizeExceededException.class, MultipartException.class})
    public ResponseEntity<ApiResponse<?>> handleMultipartError(Exception ex) {
        log.warn("Multipart exception caught: {}", ex.getMessage(), ex);
        ApiResponse<?> body = ApiResponse.builder()
                .code(ErrorCode.BAD_REQUEST.getCode())
                .message("Upload failed. Please check image size and format.")
                .errorCode(ErrorCode.BAD_REQUEST.name())
                .result(null)
                .build();
        return ResponseEntity.status(ErrorCode.BAD_REQUEST.getStatus()).body(body);
    }
}

