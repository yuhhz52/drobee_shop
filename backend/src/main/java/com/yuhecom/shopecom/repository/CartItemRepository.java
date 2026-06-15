package com.yuhecom.shopecom.repository;

import com.yuhecom.shopecom.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    List<CartItem> findByCartId(UUID cartId);

    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.product.id = :productId AND ci.productVariant.id = :variantId")
    Optional<CartItem> findByCartIdAndProductIdAndVariantId(
            @Param("cartId") UUID cartId,
            @Param("productId") UUID productId,
            @Param("variantId") UUID variantId);

    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.product.id = :productId AND ci.productVariant IS NULL")
    Optional<CartItem> findByCartIdAndProductIdAndNoVariant(
            @Param("cartId") UUID cartId,
            @Param("productId") UUID productId);

    void deleteByCartId(UUID cartId);
}
