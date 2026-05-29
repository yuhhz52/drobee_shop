export const extractList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

export const extractTotalElements = (headers, fallbackLength = 0) => {
  const contentRange = headers?.['content-range'];
  if (contentRange) {
    return parseInt(contentRange.split('/')[1], 10) || fallbackLength;
  }
  return fallbackLength;
};
