/** Os três formatos que a API aceita no envio, e portanto os únicos que ela serve. */
const EXTENSION_BY_CONTENT_TYPE: Readonly<Record<string, string>> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * ⛔ O sufixo vem do `Content-Type` da resposta, não do endereço: o endpoint da
 * foto de denúncia termina em `/image`, e derivar dali daria o caminho inteiro
 * como extensão.
 */
export function downloadFileName(baseName: string, contentType: string): string {
  const extension = EXTENSION_BY_CONTENT_TYPE[contentType];

  if (!extension) return baseName;

  return `${baseName}.${extension}`;
}
