export const getPrimaryResourceUrl = (resources = []) => {
  if (!Array.isArray(resources) || resources.length === 0) return null;
  const primary = resources.find((resource) => resource?.isPrimary && resource?.url);
  if (primary?.url) return primary.url;
  const fallback = resources.find((resource) => resource?.url);
  return fallback?.url || null;
};

export const getProductImages = (product) => {
  const resources = product?.productResources || product?.resources || [];
  if (!Array.isArray(resources) || resources.length === 0) return [];
  return resources.map((resource) => resource?.url).filter(Boolean);
};

