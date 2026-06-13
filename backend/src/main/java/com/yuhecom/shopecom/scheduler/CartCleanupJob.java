package com.yuhecom.shopecom.scheduler;

import com.yuhecom.shopecom.entity.Cart;
import com.yuhecom.shopecom.reponsitory.CartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class CartCleanupJob {

    private final CartRepository cartRepository;

    private static final int CART_EXPIRATION_DAYS = 7;

    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void cleanupExpiredAnonymousCarts() {
        log.info("Starting expired anonymous cart cleanup job");
        
        LocalDateTime expirationDate = LocalDateTime.now().minusDays(CART_EXPIRATION_DAYS);
        List<Cart> expiredCarts = cartRepository.findExpiredAnonymousCarts(expirationDate);
        
        if (expiredCarts.isEmpty()) {
            log.info("No expired anonymous carts found");
            return;
        }

        List<UUID> cartIds = expiredCarts.stream()
                .map(Cart::getId)
                .collect(Collectors.toList());

        int totalItems = expiredCarts.stream()
                .mapToInt(cart -> cart.getItems() != null ? cart.getItems().size() : 0)
                .sum();

        cartRepository.deleteCartItemsByCartIds(cartIds);
        int deletedCarts = cartRepository.deleteExpiredAnonymousCarts(cartIds);

        log.info("Cart cleanup completed: {} carts deleted, {} items removed", deletedCarts, totalItems);
    }
}
