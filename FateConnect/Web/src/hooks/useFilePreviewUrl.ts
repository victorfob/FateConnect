import { useEffect, useState } from 'react';

type Preview = { file: File; url: string };

/**
 * Endereço que o navegador exibe para um arquivo escolhido. É lido como `data:`,
 * e não como endereço de objeto: no `StrictMode` a limpeza roda antes da segunda
 * montagem, e revogaria o endereço que a tela ainda usa.
 */
export function useFilePreviewUrl(file: File | null): string | null {
  const [preview, setPreview] = useState<Preview | null>(null);

  useEffect(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') setPreview({ file, url: reader.result });
    });
    reader.readAsDataURL(file);

    return () => reader.abort();
  }, [file]);

  // O endereço guardado diz de qual arquivo ele é: trocado o arquivo, o anterior não aparece.
  if (!file || preview?.file !== file) return null;

  return preview.url;
}
