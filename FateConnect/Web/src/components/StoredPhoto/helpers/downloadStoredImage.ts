import { fetchStoredImage } from '@app/services/uploads/uploadsService';

import { downloadFileName } from './downloadFileName';

/** O navegador lê o blob depois do clique: revogar no mesmo tique pode cancelar o download. */
const OBJECT_URL_LIFETIME_MS = 60_000;

export async function downloadStoredImage(originalUrl: string, baseName: string): Promise<void> {
  const original = await fetchStoredImage(originalUrl);
  const objectUrl = URL.createObjectURL(original);

  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = downloadFileName(baseName, original.type);
  link.click();

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), OBJECT_URL_LIFETIME_MS);
}
