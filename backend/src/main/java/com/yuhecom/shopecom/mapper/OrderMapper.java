package com.yuhecom.shopecom.mapper;

import com.yuhecom.shopecom.dto.OrderDetails;
import com.yuhecom.shopecom.dto.OrderItemDetail;
import com.yuhecom.shopecom.entity.Order;
import com.yuhecom.shopecom.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ProductMapper.class, ProductVariantMapper.class})
public interface OrderMapper {

    @Mapping(source = "shipmentTrackingNumber", target = "shipmentNumber")
    @Mapping(source = "orderItemList", target = "orderItemList")
    @Mapping(source = "user", target = "user")
    OrderDetails toDto(Order order);

    List<OrderDetails> toDtoList(List<Order> orders);

    @Mapping(source = "product", target = "product")
    @Mapping(source = "productVariant", target = "productVariant")
    OrderItemDetail toOrderItemDetail(OrderItem orderItem);

    List<OrderItemDetail> toOrderItemDetailList(List<OrderItem> orderItems);
}
