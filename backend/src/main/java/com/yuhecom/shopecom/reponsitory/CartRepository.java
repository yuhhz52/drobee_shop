package com.yuhecom.shopecom.reponsitory;

import com.yuhecom.shopecom.entity.Cart;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {

    /**
     * Pessimistic write lock — prevents concurrent cart modifications.
     * Use this for addItem, updateQuantity, removeItem, clearCart.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items WHERE c.user.id = :userId")
    Optional<Cart> findByUserIdWithItemsForUpdate(@Param("userId") UUID userId);

    /**
     * Pessimistic write lock — prevents concurrent cart modifications (anonymous).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items WHERE c.sessionId = :sessionId AND c.user IS NULL")
    Optional<Cart> findBySessionIdWithItemsForUpdate(@Param("sessionId") String sessionId);

    /**
     * Read-only fetch with eager items (no lock) — for getCart.
     */
    @EntityGraph(attributePaths = {"items", "items.product", "items.productVariant"})
    @Query("SELECT c FROM Cart c WHERE c.user.id = :userId")
    Optional<Cart> findByUserIdWithItemsReadOnly(@Param("userId") UUID userId);

    /**
     * Read-only fetch with eager items (no lock) — for anonymous getCart.
     */
    @EntityGraph(attributePaths = {"items", "items.product", "items.productVariant"})
    @Query("SELECT c FROM Cart c WHERE c.sessionId = :sessionId AND c.user IS NULL")
    Optional<Cart> findBySessionIdWithItemsReadOnly(@Param("sessionId") String sessionId);
}
