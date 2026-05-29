export const inferBrand = (name = '') => {
  const upper = name.toUpperCase();
  if (upper.includes('KUKIRIN')) return 'KUKIRIN';
  if (upper.includes('DUALTRON')) return 'DUALTRON';
  if (upper.includes('TEVERUN')) return 'TEVERUN';
  if (upper.includes('ROVORON')) return 'ROVORON';
  if (upper.includes('KUICKWHEEL')) return 'KUICKWHEEL';
  return '';
};

export const inferBrandFromProduct = (product) => {
  if (!product) return '';
  const fromName = inferBrand(product.name || '');
  if (fromName) return fromName;
  return (product.categoryName || '').toUpperCase();
};
