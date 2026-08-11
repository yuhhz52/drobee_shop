package com.yuhecom.shopecom.exception;

import com.yuhecom.shopecom.dto.ValidationErrorEntry;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;

import java.util.List;

/**
 * Single place that translates exceptions to RFC 9457 {@link ProblemDetail}
 * HTTP responses. No business logic lives here. The mapping table:
 *
 * <pre>
 *   BusinessException / AppException  → ErrorCode → ProblemDetail
 *   MethodArgumentNotValidException   → VALIDATION_ERROR (400)
 *   ConstraintViolationException      → VALIDATION_ERROR (400)
 *   HttpMessageNotReadableException   → MALFORMED_REQUEST (400)
 *   MethodArgumentTypeMismatch        → MALFORMED_REQUEST (400)
 *   MissingServletRequestParameter    → MALFORMED_REQUEST (400)
 *   DataIntegrityViolationException   → DATA_CONFLICT (409)
 *   MaxUpload / MultipartException    → FILE_TOO_LARGE / FILE_UPLOAD_FAILED (413/400)
 *   AuthenticationException           → UNAUTHORIZED (401)
 *   AccessDeniedException             → FORBIDDEN (403)
 *   Exception (anything else)         → UNCATEGORIZED (500); log stack, never expose
 * </pre>
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ── Application / business ─────────────────────────────────────────────

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ProblemDetail> handleAppException(AppException ex) {
        ErrorCode code = ex.getErrorCode();
        log.warn("Handled AppException. errorCode={}, message={}", code.name(), ex.getMessage());
        return problem(ex.getErrorCode(), ex.getMessage());
    }

    // ── Validation ─────────────────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleBodyValidation(MethodArgumentNotValidException ex) {
        List<ValidationErrorEntry> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> ValidationErrorEntry.of(fe.getField(),
                        fe.getDefaultMessage() == null ? "invalid" : fe.getDefaultMessage()))
                .toList();
        log.warn("Body validation failed. errorCount={}", errors.size());
        return problem(ErrorCode.VALIDATION_ERROR,
                ErrorCode.VALIDATION_ERROR.getDefaultMessage(),
                errors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ProblemDetail> handleConstraintViolation(ConstraintViolationException ex) {
        List<ValidationErrorEntry> errors = ex.getConstraintViolations().stream()
                .map(GlobalExceptionHandler::toValidationEntry)
                .toList();
        log.warn("Constraint violation. errorCount={}", errors.size());
        return problem(ErrorCode.VALIDATION_ERROR,
                ErrorCode.VALIDATION_ERROR.getDefaultMessage(),
                errors);
    }

    // ── Malformed request ──────────────────────────────────────────────────

    @ExceptionHandler({
            HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class
    })
    public ResponseEntity<ProblemDetail> handleMalformedRequest(Exception ex) {
        log.warn("Malformed request: {}", ex.getMessage());
        return problem(ErrorCode.MALFORMED_REQUEST,
                ErrorCode.MALFORMED_REQUEST.getDefaultMessage());
    }

    // ── Persistence conflict ───────────────────────────────────────────────

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ProblemDetail> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.warn("Data integrity violation: {}", ex.getMostSpecificCause().getMessage());
        return problem(ErrorCode.DATA_CONFLICT,
                ErrorCode.DATA_CONFLICT.getDefaultMessage());
    }

    // ── Uploads ─────────────────────────────────────────────────────────────

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ProblemDetail> handleMaxUpload(MaxUploadSizeExceededException ex) {
        log.warn("Upload too large: {}", ex.getMessage());
        return problem(ErrorCode.FILE_TOO_LARGE,
                ErrorCode.FILE_TOO_LARGE.getDefaultMessage());
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ProblemDetail> handleMultipart(MultipartException ex) {
        log.warn("Multipart exception: {}", ex.getMessage());
        return problem(ErrorCode.FILE_UPLOAD_FAILED,
                ErrorCode.FILE_UPLOAD_FAILED.getDefaultMessage());
    }

    // ── Security ───────────────────────────────────────────────────────────

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ProblemDetail> handleAuthentication(AuthenticationException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        return problem(ErrorCode.UNAUTHORIZED,
                ErrorCode.UNAUTHORIZED.getDefaultMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetail> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return problem(ErrorCode.FORBIDDEN,
                ErrorCode.FORBIDDEN.getDefaultMessage());
    }

    // ── Fallback ───────────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleUnhandled(Exception ex) {
        log.error("Unhandled exception", ex);
        return problem(ErrorCode.UNCATEGORIZED,
                ErrorCode.UNCATEGORIZED.getDefaultMessage());
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private static ResponseEntity<ProblemDetail> problem(ErrorCode code, String detail) {
        return problem(code, detail, null);
    }

    private static ResponseEntity<ProblemDetail> problem(
            ErrorCode code, String detail, List<ValidationErrorEntry> errors) {
        ProblemDetail pd = ProblemDetailFactory.of(code, detail, errors);
        return ResponseEntity.status(code.getStatus()).body(pd);
    }

    private static ValidationErrorEntry toValidationEntry(ConstraintViolation<?> v) {
        String path = v.getPropertyPath() == null ? "" : v.getPropertyPath().toString();
        return ValidationErrorEntry.of(path, v.getMessage());
    }
}
