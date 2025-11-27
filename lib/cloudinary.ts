/**
 * Cloudinary utility functions for image optimization
 */

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'limit';
  gravity?: 'face' | 'auto' | 'center';
}

/**
 * Generate optimized Cloudinary URL with transformations
 */
export function getOptimizedCloudinaryUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options;

  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  const transformString = transformations.length > 0
    ? `${transformations.join(',')}/`
    : '';

  // Extract public ID from full URL if provided
  const cleanPublicId = publicId.includes('res.cloudinary.com')
    ? publicId.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '')
    : publicId;

  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name'}/image/upload/${transformString}${cleanPublicId}`;
}

/**
 * Get optimized profile picture URL
 */
export function getProfilePictureUrl(publicId: string, size: number = 200): string {
  return getOptimizedCloudinaryUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'face',
    quality: 80,
    format: 'auto',
  });
}

/**
 * Get optimized document/image URL
 */
export function getDocumentUrl(publicId: string, maxWidth: number = 1200): string {
  return getOptimizedCloudinaryUrl(publicId, {
    width: maxWidth,
    crop: 'limit',
    quality: 85,
    format: 'auto',
  });
}

