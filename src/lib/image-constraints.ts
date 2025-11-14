export const MAX_PRODUCT_IMAGES = 6;
export const MAX_PRODUCT_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo

export const ACCEPTED_PHOTO_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
] as const;

export const ACCEPTED_PHOTO_EXTENSIONS_LABEL = 'JPG, JPEG, PNG, WebP, GIF, HEIC, HEIF';
export const ACCEPTED_PHOTO_ACCEPT = ACCEPTED_PHOTO_MIME_TYPES.join(',');

export const isAcceptedPhotoType = (mime: string) =>
  ACCEPTED_PHOTO_MIME_TYPES.includes(mime.toLowerCase() as (typeof ACCEPTED_PHOTO_MIME_TYPES)[number]);
