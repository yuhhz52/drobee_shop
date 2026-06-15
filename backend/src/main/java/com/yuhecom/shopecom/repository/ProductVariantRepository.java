package com.yuhecom.shopecom.repository;

import com.yuhecom.shopecom.entity.ProductVariant;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ProductVariant> findWithLockingById(UUID id);

    /**
     * Atomically deduct stock quantity.
     * Returns the number of rows affected (1 if successful, 0 if insufficient stock).
     * This prevents race conditions in concurrent checkout scenarios.
     */
    @Modifying
    @Query("UPDATE ProductVariant v SET v.stockQuantity = v.stockQuantity - :quantity " +
           "WHERE v.id = :id AND v.stockQuantity >= :quantity")
    int deductStock(@Param("id") UUID id, @Param("quantity") int quantity);

    /**
     * Atomically restore stock quantity (for order cancellation).
     */
    @Modifying
    @Query("UPDATE ProductVariant v SET v.stockQuantity = v.stockQuantity + :quantity " +
           "WHERE v.id = :id")
    int restoreStock(@Param("id") UUID id, @Param("quantity") int quantity);
}
