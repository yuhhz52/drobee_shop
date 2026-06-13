package com.yuhecom.shopecom.reponsitory;

import com.yuhecom.shopecom.entity.Cart;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
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

    /**
     * Pessimistic write lock for checkout - prevents concurrent modifications.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items WHERE c.id = :cartId AND c.user.id = :userId")
    Optional<Cart> findByIdAndUserIdForCheckout(@Param("cartId") UUID cartId, @Param("userId") UUID userId);

    /**
     * Find cart by ID for checkout (requires user validation in service layer).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"items", "items.product", "items.productVariant"})
    @Query("SELECT c FROM Cart c WHERE c.id = :cartId")
    Optional<Cart> findByIdForCheckout(@Param("cartId") UUID cartId);

    /**
     * Find expired anonymous carts for cleanup job.
     */
    @Query("SELECT c FROM Cart c WHERE c.user IS NULL AND c.updatedAt < :expirationDate")
    List<Cart> findExpiredAnonymousCarts(@Param("expirationDate") LocalDateTime expirationDate);

    /**
     * Delete all cart items for expired carts.
     */
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id IN :cartIds")
    void deleteCartItemsByCartIds(@Param("cartIds") List<UUID> cartIds);

    /**
     * Delete expired anonymous carts.
     */
    @Modifying
    @Query("DELETE FROM Cart c WHERE c.id IN :cartIds AND c.user IS NULL")
    int deleteExpiredAnonymousCarts(@Param("cartIds") List<UUID> cartIds);
}
