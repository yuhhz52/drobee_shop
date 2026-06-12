package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.dto.CartItemRequest;
import com.yuhecom.shopecom.dto.CartResponse;

import java.util.UUID;

public interface CartService {

    CartResponse getCart(User user, String sessionId);

    CartResponse addItem(User user, String sessionId, CartItemRequest request);

    CartResponse updateItemQuantity(User user, String sessionId, UUID itemId, int quantity);

    CartResponse removeItem(User user, String sessionId, UUID itemId);

    void clearCart(User user, String sessionId);

    CartResponse mergeAnonymousCart(User user, String sessionId);
}
