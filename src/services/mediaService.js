import NetworkService from './networkService';

export const MAX_MEDIA_BYTES = 8 * 1024 * 1024;
const savedUploads = new WeakMap();
const documents = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export function mediaUrl(value) {
  if (!value || typeof value !== 'string') return '';
  if (value.startsWith('/api/')) return new URL(value, NetworkService.baseUrl).href;
  return /^(https?:|blob:|data:image\/)/.test(value) ? value : '';
}

/** Resize large camera images before transport; the server enforces final compression. */
export async function compressImage(file, { kind = 'photo' } = {}) {
  const image = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    if (image.width * image.height > 24_000_000) throw new Error('Choose an image below 24 megapixels.');
    const edge = kind === 'document' ? 2200 : 1600;
    const ratio = Math.min(1, edge / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * ratio));
    canvas.height = Math.max(1, Math.round(image.height * ratio));
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .94));
    if (!blob) throw new Error('Unable to process this image. Try a JPEG or PNG.');
    return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' });
  } finally { image.close(); }
}

/** Shared optional image/document upload. Returns a DB-backed URL, never a base64 payload. */
export async function saveImage(file, { kind = 'photo' } = {}) {
  if (!file) return null;
  if (!(file instanceof File)) throw new Error('Choose a valid file.');
  if (!file.size || file.size > MAX_MEDIA_BYTES) throw new Error('Choose a non-empty file up to 8 MB.');
  const image = file.type.startsWith('image/') && !['image/svg+xml'].includes(file.type);
  if (!image && !(kind === 'document' && documents.includes(file.type))) throw new Error('Choose a JPEG, PNG or WebP image, or a PDF / Word document.');
  const cached = savedUploads.get(file);
  if (cached?.[kind]) return cached[kind];
  const prepared = image ? await compressImage(file, { kind }) : file;
  const form = new FormData(); form.append('file', prepared);
  const result = await NetworkService.upload('/files/media', form, { params: { kind } });
  if (!result?.fileUrl || !result?.contentType) throw new Error('The server did not confirm that the file was saved.');
  const saved = { ...result, fileUrl: mediaUrl(result.fileUrl) };
  savedUploads.set(file, { ...cached, [kind]: saved });
  return saved;
}

export function mediaReady(form) {
  const pending = form.querySelector('[data-media-pending="true"], [data-media-error="true"]');
  if (!pending) return true;
  pending.scrollIntoView({ block: 'center', behavior: 'smooth' });
  pending.focus();
  return false;
}
