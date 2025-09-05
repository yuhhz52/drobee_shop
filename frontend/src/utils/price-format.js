// Utility function to format prices in VND
export const formatPriceVND = (price) => {
  if (!price && price !== 0) return '0₫';
  
  // Convert to number if it's a string
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Format with Vietnamese locale and VND symbol
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericPrice);
};

// Alternative format without currency symbol (just the number with ₫)
export const formatPriceVNDSimple = (price) => {
  if (!price && price !== 0) return '0₫';
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  return `${numericPrice.toLocaleString('vi-VN')}₫`;
};

// Format price for display in product cards and details
export const formatDisplayPrice = (price) => {
  return formatPriceVNDSimple(price);
}; 