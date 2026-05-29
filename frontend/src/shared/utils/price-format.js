// Utility function to format prices in VND
export const formatPriceVND = (price) => {
  if (!price && price !== 0) return '0₫';

  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice);
};

export const formatPriceVNDSimple = (price) => {
  if (!price && price !== 0) return '0₫';

  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  return `${numericPrice.toLocaleString('vi-VN')}₫`;
};

export const formatDisplayPrice = (price) => {
  return formatPriceVNDSimple(price);
};

/** EUR format matching vepace.com product cards */
export const formatPriceEUR = (price) => {
  if (!price && price !== 0) return '€0,00';

  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice);
};
