package com.yuhecom.shopecom.repository;

import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.dto.OrderDetails;
import com.yuhecom.shopecom.entity.Order;
import com.yuhecom.shopecom.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yuhecom.shopecom.entity.PaymentStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUser(User user);

    @Override
    @EntityGraph(attributePaths = {
            "user",
            "address",
            "payment",
            "orderItemList",
            "orderItemList.product",
            "orderItemList.productVariant"
    })
    Page<Order> findAll(Pageable pageable);

    @Query("""
           SELECT DISTINCT o FROM Order o
           LEFT JOIN FETCH o.orderItemList items
           LEFT JOIN FETCH items.product p
           LEFT JOIN FETCH items.productVariant pv
           WHERE o.user = :user
           """)
    List<Order> findByUserWithItems(@Param("user") User user);

    /**
     * Find abandoned orders - PENDING orders with PENDING payment older than cutoff time.
     */
    @Query("""
           SELECT o FROM Order o
           WHERE o.orderStatus = :orderStatus
           AND o.payment.paymentStatus = :paymentStatus
           AND o.orderDate < :cutoffTime
           """)
    List<Order> findAbandonedOrders(
            @Param("orderStatus") OrderStatus orderStatus,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("cutoffTime") LocalDateTime cutoffTime
    );

    /**
     * Find order by ID with all items and related entities loaded.
     */
    @Query("""
           SELECT DISTINCT o FROM Order o
           LEFT JOIN FETCH o.user
           LEFT JOIN FETCH o.address
           LEFT JOIN FETCH o.payment
           LEFT JOIN FETCH o.orderItemList items
           LEFT JOIN FETCH items.product
           LEFT JOIN FETCH items.productVariant
           WHERE o.id = :id
           """)
    java.util.Optional<Order> findByIdWithItems(@Param("id") UUID id);
}
