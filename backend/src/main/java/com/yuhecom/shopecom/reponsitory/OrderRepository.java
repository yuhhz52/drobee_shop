package com.yuhecom.shopecom.reponsitory;

import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.dto.OrderDetails;
import com.yuhecom.shopecom.entity.Order;
import com.yuhecom.shopecom.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUser(User user);


}
