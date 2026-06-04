package com.yuhecom.shopecom.exception;

import com.yuhecom.shopecom.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

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

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("Invalid request");
        ApiResponse<?> body = ApiResponse.builder()
                .code(ErrorCode.BAD_REQUEST.getCode())
                .message(message)
                .errorCode("VALIDATION_FAILED")
                .result(null)
                .build();
        return ResponseEntity.status(ErrorCode.BAD_REQUEST.getStatus()).body(body);
    }

    @ExceptionHandler({
            HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class,
            DataIntegrityViolationException.class
    })
    public ResponseEntity<ApiResponse<?>> handleBadRequest(Exception ex) {
        log.warn("Bad request exception caught: {}", ex.getMessage());
        ApiResponse<?> body = ApiResponse.builder()
                .code(ErrorCode.BAD_REQUEST.getCode())
                .message(ErrorCode.BAD_REQUEST.getMessage())
                .errorCode(ErrorCode.BAD_REQUEST.name())
                .result(null)
                .build();
        return ResponseEntity.status(ErrorCode.BAD_REQUEST.getStatus()).body(body);
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
