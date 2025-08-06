package com.yuhecom.shopecom.dto;

import lombok.*;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.UUID;

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
    private Double totalAmount;
    private String paymentMethod;
    private Double discount;
    private Date expectedDeliveryDate;


}
