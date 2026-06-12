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
    const subTotal = item?.subTotal ?? (item.unitPrice ? item.unitPrice * item.quantity : 0);
    total += subTotal;
    return {
      productId: item.productId,
      productVariantId: item.variantId || item.variant?.id || null,
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