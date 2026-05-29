package com.yuhecom.shopecom.dto;

import lombok.*;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {
    private UUID userId;
    private Date orderDate;
    private UUID addressId;
    private List<OrderItemRequest> orderItemRequest;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private BigDecimal discount;
    private Date expectedDeliveryDate;


}
