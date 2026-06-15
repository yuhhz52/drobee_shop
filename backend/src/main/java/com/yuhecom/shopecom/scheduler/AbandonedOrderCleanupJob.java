package com.yuhecom.shopecom.scheduler;

import com.yuhecom.shopecom.entity.Order;
import com.yuhecom.shopecom.entity.OrderStatus;
import com.yuhecom.shopecom.entity.PaymentStatus;
import com.yuhecom.shopecom.repository.OrderRepository;
import com.yuhecom.shopecom.repository.ProductVariantRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled job to clean up abandoned orders.
 * Cancels PENDING orders that have not been paid within the configured timeout.
 * Restores stock for cancelled orders.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AbandonedOrderCleanupJob {

    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;

    /**
     * Timeout in hours before an order is considered abandoned.
     * Default: 2 hours
     */
    @Value("${app.order.abandoned-timeout-hours:2}")
    private int abandonedTimeoutHours;

    /**
     * Run every 30 minutes to check for abandoned orders.
     */
    @Scheduled(fixedRate = 30 * 60 * 1000) // 30 minutes
    @Transactional
    public void cleanupAbandonedOrders() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(abandonedTimeoutHours);

        List<Order> abandonedOrders = orderRepository.findAbandonedOrders(
                OrderStatus.PENDING,
                PaymentStatus.PENDING,
                cutoffTime
        );

        if (abandonedOrders.isEmpty()) {
            log.debug("No abandoned orders found");
            return;
        }

        log.info("Found {} abandoned orders to clean up", abandonedOrders.size());

        for (Order order : abandonedOrders) {
            try {
                cancelAbandonedOrder(order);
            } catch (Exception e) {
                log.error("Failed to cancel abandoned order {}: {}", order.getId(), e.getMessage(), e);
            }
        }

        log.info("Abandoned order cleanup completed");
    }

    private void cancelAbandonedOrder(Order order) {
        log.info("Cancelling abandoned order: {} created at {}", order.getId(), order.getOrderDate());

        // Restore stock for each item
        if (order.getOrderItemList() != null) {
            order.getOrderItemList().forEach(item -> {
                if (item.getProductVariant() != null) {
                    productVariantRepository.restoreStock(
                            item.getProductVariant().getId(),
                            item.getQuantity()
                    );
                    log.debug("Restored {} units for variant {}",
                            item.getQuantity(),
                            item.getProductVariant().getId());
                }
            });
        }

        // Update order and payment status
        order.setOrderStatus(OrderStatus.CANCELLED);
        if (order.getPayment() != null) {
            order.getPayment().setPaymentStatus(PaymentStatus.FAILED);
        }
        orderRepository.save(order);

        log.info("Abandoned order {} cancelled and stock restored", order.getId());
    }
}
