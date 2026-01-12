import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';

export async function pickLogoAsBase64(): Promise<string | null> {
  const file = await open({
    multiple: false,
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'svg'] }],
  });

  if (!file) return null;

  const filePath = file as string;
  if (!filePath) return null;

  const extension = filePath.split('.').pop()?.toLowerCase() || 'png';
  const mimeType = extension === 'svg' ? 'image/svg+xml' : `image/${extension === 'jpg' ? 'jpeg' : extension}`;

  const fileData = await readFile(filePath);
  const base64 = btoa(String.fromCharCode(...fileData));
  
  return `data:${mimeType};base64,${base64}`;
}
