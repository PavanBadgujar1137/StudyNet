/**
 * Utility functions for robust image processing, cross-browser compatibility
 * (especially macOS, iOS Safari, Android, Windows), HEIC-to-JPEG conversion,
 * and live previews.
 */

/**
 * Validates whether a file is an acceptable image
 * @param {File} file 
 * @param {number} maxMb - Maximum size in MB (defaults to 1024MB = 1GB)
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateImageFile = (file, maxMb = 1024) => {
  if (!file) return { valid: false, error: 'No file selected' };

  const validExtensions = /\.(jpg|jpeg|png|webp|gif|heic|heif|bmp|svg|tiff|avif)$/i;
  const isImageMime = file.type.startsWith('image/') || file.type === '';
  const hasValidExt = validExtensions.test(file.name);

  if (!isImageMime && !hasValidExt) {
    return { valid: false, error: 'Please select a valid image file (JPG, PNG, WebP, GIF, HEIC, SVG)' };
  }

  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    const limitText = maxMb >= 1024 ? `${(maxMb / 1024).toFixed(maxMb % 1024 === 0 ? 0 : 1)}GB` : `${maxMb}MB`;
    const selectedText = file.size >= 1024 * 1024 * 1024 
      ? `${(file.size / (1024 * 1024 * 1024)).toFixed(1)}GB` 
      : `${(file.size / (1024 * 1024)).toFixed(1)}MB`;
    return { valid: false, error: `Image size must be less than ${limitText} (selected ${selectedText})` };
  }

  return { valid: true };
};

/**
 * Converts HEIC/HEIF or Apple photo formats to standard high-quality JPEG on devices
 * that can decode HEIC natively (like macOS Safari and iOS Safari/Chrome),
 * or returns the original file if conversion isn't needed or not supported.
 *
 * @param {File} file - Selected image file
 * @param {number} quality - JPEG export quality (0 to 1)
 * @returns {Promise<File>} Standard web-compatible File object
 */
export const processImageForUpload = async (file, quality = 0.92) => {
  if (!file) return file;

  const fileNameLower = (file.name || '').toLowerCase();
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    fileNameLower.endsWith('.heic') ||
    fileNameLower.endsWith('.heif');

  // If it's already a standard web format, return as is
  if (!isHeic && ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    return file;
  }

  // Attempt canvas-based conversion for HEIC/unusual image types
  try {
    let sourceElement = null;
    let width = 0;
    let height = 0;

    if (typeof createImageBitmap === 'function') {
      try {
        sourceElement = await createImageBitmap(file);
        width = sourceElement.width;
        height = sourceElement.height;
      } catch {
        sourceElement = null;
      }
    }

    if (!sourceElement) {
      // Fallback to HTMLImageElement
      const objectUrl = URL.createObjectURL(file);
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = (e) => reject(e);
          img.src = objectUrl;
        });
        sourceElement = img;
        width = img.naturalWidth || img.width;
        height = img.naturalHeight || img.height;
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    }

    if (sourceElement && width > 0 && height > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(sourceElement, 0, 0, width, height);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', quality);
      });

      if (blob) {
        const baseName = (file.name || 'image').replace(/\.[^/.]+$/, '');
        const newFileName = `${baseName}.jpg`;
        return new File([blob], newFileName, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
      }
    }
  } catch (err) {
    console.warn('[ImageProcessing] Conversion fallback to original file:', err);
  }

  return file;
};

/**
 * Formats bytes to human readable string (e.g. 1.2 MB)
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
