export const PLACEHOLDER_IMAGE = '/images/product-placeholder.svg';

export const sanitizeBase64 = (value?: string | null): string => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  let cleanValue = value.trim();
  if (cleanValue.startsWith('data:')) {
    const base64Index = cleanValue.indexOf('base64,');
    if (base64Index !== -1) {
      cleanValue = cleanValue.substring(base64Index + 7);
    }
  }

  return cleanValue.replace(/\s+/g, '');
};

export const buildDataUri = (data: string | null | undefined, mime?: string | null): string => {
  const cleanBase64 = sanitizeBase64(data);
  if (!cleanBase64 || !mime) {
    return '';
  }

  return `data:${mime};base64,${cleanBase64}`;
};

export const resolveImageSrc = (image?: { url?: string | null; data?: string | null; mime?: string | null }): string => {
  if (!image) {
    return PLACEHOLDER_IMAGE;
  }

  if (image.url) {
    return image.url;
  }

  const dataUri = buildDataUri(image.data, image.mime ?? undefined);
  return dataUri || PLACEHOLDER_IMAGE;
};

export const stripDataUriPrefix = (value: string): string => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  if (value.startsWith('data:')) {
    const base64Index = value.indexOf('base64,');
    if (base64Index !== -1) {
      return value.substring(base64Index + 7);
    }
  }

  return value;
};
