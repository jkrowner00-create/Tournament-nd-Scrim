/**
 * ImgBB Image Uploader Service
 * API Key provided from project configuration: e8bc3e8e46adc2e873d97de8767d928b
 */

export const IMGBB_API_KEY = 'e8bc3e8e46adc2e873d97de8767d928b';

export async function uploadToImgBB(file: File, onProgress?: (msg: string) => void): Promise<string> {
  if (!file) throw new Error('File not selected.');

  const formData = new FormData();
  formData.append('image', file);

  if (onProgress) onProgress('Uploading image to ImgBB...');

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMsg = `Upload failed: HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg += ` - ${errorData?.error?.message || response.statusText}`;
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    if (data.success && data.data?.url) {
      if (onProgress) onProgress('Upload complete!');
      return data.data.url;
    } else {
      throw new Error(data.error?.message || 'ImgBB upload returned unsuccessful response');
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (onProgress) onProgress(`Upload Error: ${msg}`);
    throw err;
  }
}
