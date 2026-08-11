package com.yuhecom.shopecom.exception;

import com.yuhecom.shopecom.dto.ValidationErrorEntry;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void appException_mapsToProblemDetailWithErrorCode() {
        ResponseEntity<ProblemDetail> resp = handler.handleAppException(
                new BusinessException(ErrorCode.ORDER_NOT_FOUND, "Order not found with id abc"));

        assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode());
        ProblemDetail pd = resp.getBody();
        assertNotNull(pd);
        assertEquals(404, pd.getStatus());
        assertEquals("Order not found with id abc", pd.getDetail());
        assertEquals("ORDER_NOT_FOUND", pd.getProperties().get("errorCode"));
        assertEquals(ErrorCode.ORDER_NOT_FOUND.getAppCode(), pd.getProperties().get("appCode"));
        assertNotNull(pd.getType());
        assertTrue(pd.getType().toString().endsWith("/order-not-found"));
    }

    @Test
    void insufficientStock_mapsToConflict() {
        ResponseEntity<ProblemDetail> resp = handler.handleAppException(
                new BusinessException(ErrorCode.INSUFFICIENT_STOCK, "Only 3 items available"));

        assertEquals(HttpStatus.CONFLICT, resp.getStatusCode());
        assertEquals("INSUFFICIENT_STOCK", resp.getBody().getProperties().get("errorCode"));
    }

    @Test
    void paymentFailed_mapsToConflict() {
        ResponseEntity<ProblemDetail> resp = handler.handleAppException(
                new AppException(ErrorCode.PAYMENT_FAILED));

        assertEquals(HttpStatus.CONFLICT, resp.getStatusCode());
    }

    @Test
    void paymentTimeout_mapsToRequestTimeout() {
        ResponseEntity<ProblemDetail> resp = handler.handleAppException(
                new AppException(ErrorCode.PAYMENT_TIMEOUT));

        assertEquals(HttpStatus.REQUEST_TIMEOUT, resp.getStatusCode());
    }

    @Test
    void couponMinOrderNotMet_mapsTo422() {
        ResponseEntity<ProblemDetail> resp = handler.handleAppException(
                new AppException(ErrorCode.COUPON_MIN_ORDER_NOT_MET));

        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, resp.getStatusCode());
    }

    @Test
    void validation_returnsBadRequestWithErrors() throws Exception {
        MethodArgumentNotValidException ex = buildBeanBindingException();
        ResponseEntity<ProblemDetail> resp = handler.handleBodyValidation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
        ProblemDetail pd = resp.getBody();
        assertEquals("VALIDATION_ERROR", pd.getProperties().get("errorCode"));
        @SuppressWarnings("unchecked")
        List<ValidationErrorEntry> errs =
                (List<ValidationErrorEntry>) pd.getProperties().get("errors");
        assertNotNull(errs);
        assertEquals(2, errs.size());
        assertEquals("name", errs.get(0).field());
        assertEquals("price", errs.get(1).field());
    }

    @Test
    void constraintViolation_mapsTo400WithErrors() {
        ConstraintViolation<?> cv = mock(ConstraintViolation.class);
        Path path = mock(Path.class);
        when(path.toString()).thenReturn("cart.items[0].quantity");
        when(cv.getPropertyPath()).thenReturn(path);
        when(cv.getMessage()).thenReturn("must be greater than zero");

        ConstraintViolationException ex = new ConstraintViolationException(Set.of(cv));
        ResponseEntity<ProblemDetail> resp = handler.handleConstraintViolation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
        @SuppressWarnings("unchecked")
        List<ValidationErrorEntry> errs =
                (List<ValidationErrorEntry>) resp.getBody().getProperties().get("errors");
        assertEquals(1, errs.size());
        assertEquals("cart.items[0].quantity", errs.get(0).field());
    }

    @Test
    void httpMessageNotReadable_mapsToMalformedRequest() {
        ResponseEntity<ProblemDetail> resp = handler.handleMalformedRequest(
                new HttpMessageNotReadableException("Unexpected token"));

        assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
        assertEquals("MALFORMED_REQUEST", resp.getBody().getProperties().get("errorCode"));
    }

    @Test
    void dataIntegrityViolation_mapsToConflict() {
        ResponseEntity<ProblemDetail> resp = handler.handleDataIntegrity(
                new DataIntegrityViolationException("duplicate key",
                        new RuntimeException("unique constraint")));

        assertEquals(HttpStatus.CONFLICT, resp.getStatusCode());
        assertEquals("DATA_CONFLICT", resp.getBody().getProperties().get("errorCode"));
    }

    @Test
    void maxUploadSizeExceeded_mapsToPayloadTooLarge() {
        ResponseEntity<ProblemDetail> resp = handler.handleMaxUpload(
                new MaxUploadSizeExceededException(10_000_000L));

        assertEquals(HttpStatus.PAYLOAD_TOO_LARGE, resp.getStatusCode());
        assertEquals("FILE_TOO_LARGE", resp.getBody().getProperties().get("errorCode"));
    }

    @Test
    void authenticationException_mapsTo401() {
        ResponseEntity<ProblemDetail> resp = handler.handleAuthentication(
                new BadCredentialsException("bad creds"));

        assertEquals(HttpStatus.UNAUTHORIZED, resp.getStatusCode());
        assertEquals("UNAUTHORIZED", resp.getBody().getProperties().get("errorCode"));
    }

    @Test
    void accessDenied_mapsTo403() {
        ResponseEntity<ProblemDetail> resp = handler.handleAccessDenied(
                new AccessDeniedException("denied"));

        assertEquals(HttpStatus.FORBIDDEN, resp.getStatusCode());
        assertEquals("FORBIDDEN", resp.getBody().getProperties().get("errorCode"));
    }

    @Test
    void unhandled_mapsTo500AndDoesNotLeakMessage() {
        ResponseEntity<ProblemDetail> resp = handler.handleUnhandled(
                new IllegalStateException("internal: NPE at com.foo.Bar#baz"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, resp.getStatusCode());
        ProblemDetail pd = resp.getBody();
        assertEquals("UNCATEGORIZED", pd.getProperties().get("errorCode"));
        assertEquals(ErrorCode.UNCATEGORIZED.getDefaultMessage(), pd.getDetail());
        // Internal implementation detail must not leak.
        assertTrue(!pd.getDetail().contains("NPE"));
        assertTrue(!pd.getDetail().contains("com.foo"));
    }

    /**
     * Build a {@link MethodArgumentNotValidException} via Mockito so we don't
     * depend on a specific constructor signature in any Spring version.
     */
    private static MethodArgumentNotValidException buildBeanBindingException() {
        org.springframework.validation.BindingResult bindingResult =
                mock(org.springframework.validation.BindingResult.class);
        org.springframework.validation.FieldError fe1 = new org.springframework.validation.FieldError(
                "product", "name", "must not be blank");
        org.springframework.validation.FieldError fe2 = new org.springframework.validation.FieldError(
                "product", "price", "must be greater than 0");
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fe1, fe2));

        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);
        return ex;
    }
}