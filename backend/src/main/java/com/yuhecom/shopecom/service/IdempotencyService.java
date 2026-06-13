package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.entity.IdempotencyKey;
import com.yuhecom.shopecom.exception.AppException;
import com.yuhecom.shopecom.exception.ErrorCode;
import com.yuhecom.shopecom.reponsitory.IdempotencyKeyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing idempotency keys to prevent duplicate order creation.
 * Keys expire after 24 hours to prevent unbounded growth.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IdempotencyService {

    private final IdempotencyKeyRepository idempotencyKeyRepository;

    private static final int KEY_EXPIRY_HOURS = 24;

    /**
     * Check if an idempotency key exists and is not expired.
     * Returns the existing response if found, otherwise returns empty.
     */
    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> getExistingResponse(String idempotencyKey) {
        return idempotencyKeyRepository.findByIdempotencyKey(idempotencyKey)
                .filter(key -> !key.isExpired())
                .map(IdempotencyKey::getResponse);
    }

    /**
     * Create a new idempotency key record before processing.
     * If key already exists (race condition), throws exception.
     */
    @Transactional
    public IdempotencyKey createKey(String idempotencyKey, UUID orderId) {
        // Check if key already exists
        Optional<IdempotencyKey> existing = idempotencyKeyRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            IdempotencyKey key = existing.get();
            if (!key.isExpired()) {
                // Key exists and not expired - this is a duplicate request
                throw new AppException(ErrorCode.DUPLICATE_REQUEST,
                        "Request with this idempotency key is already being processed");
            }
            // Key expired, can reuse
            idempotencyKeyRepository.delete(key);
        }

        IdempotencyKey newKey = IdempotencyKey.builder()
                .idempotencyKey(idempotencyKey)
                .orderId(orderId)
                .expiresAt(LocalDateTime.now().plusHours(KEY_EXPIRY_HOURS))
                .build();

        return idempotencyKeyRepository.save(newKey);
    }

    /**
     * Update the idempotency key with the response after processing completes.
     */
    @Transactional
    public void completeKey(String idempotencyKey, UUID orderId, Map<String, Object> response) {
        idempotencyKeyRepository.findByIdempotencyKey(idempotencyKey)
                .ifPresent(key -> {
                    key.setOrderId(orderId);
                    key.setResponse(response);
                    idempotencyKeyRepository.save(key);
                    log.info("Idempotency key completed: {} for order: {}", idempotencyKey, orderId);
                });
    }

    /**
     * Delete an idempotency key (e.g., on failure to allow retry).
     */
    @Transactional
    public void deleteKey(String idempotencyKey) {
        idempotencyKeyRepository.findByIdempotencyKey(idempotencyKey)
                .ifPresent(key -> {
                    idempotencyKeyRepository.delete(key);
                    log.info("Idempotency key deleted: {}", idempotencyKey);
                });
    }

    /**
     * Cleanup expired idempotency keys daily at 3 AM.
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupExpiredKeys() {
        int deleted = idempotencyKeyRepository.deleteExpiredKeys(LocalDateTime.now());
        log.info("Cleaned up {} expired idempotency keys", deleted);
    }
}
