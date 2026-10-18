/**
 * Client-side logo processing.
 * - Validates format (PNG/JPEG)
 * - Resizes to max 600x200 keeping aspect ratio
 * - Re-encodes as PNG or JPEG to strip EXIF
 * - Ensures result is <= 300KB
 */
export async function processLogoClient(file: File): Promise<Blob> {
  if (!['image/png', 'image/jpeg'].includes(file.type)) {
    throw new Error("Format non supporté. Utilisez PNG ou JPEG.");
  }
  
  // Create ImageBitmap (fast and handles EXIF orientation automatically in modern browsers)
  const bitmap = await createImageBitmap(file);
  
  let { width, height } = bitmap;
  const MAX_WIDTH = 600;
  const MAX_HEIGHT = 200;
  
  // Calculate new dimensions keeping aspect ratio
  if (width > MAX_WIDTH) {
    height = (height * MAX_WIDTH) / width;
    width = MAX_WIDTH;
  }
  if (height > MAX_HEIGHT) {
    width = (width * MAX_HEIGHT) / height;
    height = MAX_HEIGHT;
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Erreur interne (Canvas).");
  
  // Fill white background for JPEG (in case of transparency conversion)
  if (file.type === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }
  
  ctx.drawImage(bitmap, 0, 0, width, height);
  
  // Try to encode, adjusting quality if JPEG, or just PNG
  // Factur-X usually prefers PNG for logos to support transparency.
  const targetType = file.type;
  let quality = 0.9;
  
  const encodeCanvas = (type: string, q: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Échec de l'encodage"));
      }, type, q);
    });
  }
  
  let blob = await encodeCanvas(targetType, quality);
  
  // If > 300KB and it's JPEG, we can reduce quality.
  while (blob.size > 300 * 1024 && targetType === 'image/jpeg' && quality > 0.3) {
    quality -= 0.2;
    blob = await encodeCanvas(targetType, quality);
  }
  
  if (blob.size > 300 * 1024) {
    throw new Error("L'image est trop volumineuse même après redimensionnement (max 300 Ko).");
  }
  
  return blob;
}
