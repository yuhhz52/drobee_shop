package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.dto.CartCheckoutValidation;
import com.yuhecom.shopecom.dto.CartItemRequest;
import com.yuhecom.shopecom.dto.CartResponse;
import com.yuhecom.shopecom.entity.Cart;

import java.util.UUID;

public interface CartService {

    CartResponse getCart(User user, String sessionId);

    CartResponse addItem(User user, String sessionId, CartItemRequest request);

    CartResponse updateItemQuantity(User user, String sessionId, UUID itemId, int quantity);

    CartResponse removeItem(User user, String sessionId, UUID itemId);

    void clearCart(User user, String sessionId);

    CartResponse mergeAnonymousCart(User user, String sessionId);

    /**
     * Get cart by ID with pessimistic lock for checkout operations.
     * Validates that the cart belongs to the user.
     */
    Cart getCartForCheckout(User user, UUID cartId);

    /**
     * Validate cart for checkout - checks stock availability and product status.
     * Returns detailed validation result for frontend display.
     */
    CartCheckoutValidation validateCartForCheckout(Cart cart);

    /**
     * Clear cart after successful order creation.
     * Called after stock has been deducted.
     */
    void clearCartAfterCheckout(UUID cartId);
}
