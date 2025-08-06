package com.yuhecom.shopecom.dto;

import com.yuhecom.shopecom.entity.Address;
import com.yuhecom.shopecom.entity.OrderStatus;
import lombok.*;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetails {

    private UUID id;
    private String orderDisplayCode;
    private Date orderDate;
    private Address address;
    private Double totalAmount;
    private OrderStatus orderStatus;
    private String shipmentNumber;
    private Date expectedDeliveryDate;
    private List<OrderItemDetail> orderItemList;
    private String paymentMethod;
}
