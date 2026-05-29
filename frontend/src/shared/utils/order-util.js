export const createOrderRequest = (cartItems, userId, addressId) => {
  const request = {
    userId,
    addressId,
    orderDate: new Date().toISOString(),
    paymentMethod: 'CARD',
    discount: 0,
    currency: 'vnd',
  };

  let total = 0;
  const orderItems = cartItems.map(item => {
    total += item?.subTotal || 0;
    return {
      productId: item.productId,
      productVariantId: item.variant?.id,
      discount: 0,
      quantity: item.quantity,
    };
  });

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  request.orderItemRequest = orderItems;
  request.totalAmount = Math.round(total * 100) / 100;
  request.expectedDeliveryDate = deliveryDate.toISOString();

  return request;
};

export const getStepCount = {
    'PENDING':1,
    'IN_PROGRESS':2,
    'SHIPPED':3,
    'DELIVERED':4
}