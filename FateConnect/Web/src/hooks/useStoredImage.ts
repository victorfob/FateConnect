import { useEffect, useState } from 'react';

import { fetchStoredImage } from '@app/services/uploads/uploadsService';

export type StoredImage = { objectUrl: string; contentType: string };

export type StoredImageState = Readonly<{ image: StoredImage | null; loading: boolean }>;

/** `image` nulo com a busca encerrada é a falha: o endereço fica, a foto não veio. */
type SettledImage = { url: string; image: StoredImage | null };

/** Endereço que o navegador possa exibir, buscado com o token e revogado ao sair. */
export function useStoredImage(url: string | null): StoredImageState {
  const [settled, setSettled] = useState<SettledImage | null>(null);

  useEffect(() => {
    if (!url) return;

    let created: string | null = null;
    let cancelled = false;

    async function load(imageUrl: string) {
      try {
        const image = await fetchStoredImage(imageUrl);
        created = URL.createObjectURL(image);

        // Saiu da tela antes de a foto chegar: o endereço nasce e morre aqui.
        if (cancelled) {
          URL.revokeObjectURL(created);
          return;
        }

        setSettled({ url: imageUrl, image: { objectUrl: created, contentType: image.type } });
      } catch {
        if (!cancelled) setSettled({ url: imageUrl, image: null });
      }
    }

    void load(url);

    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [url]);

  if (!url) return { image: null, loading: false };

  // O endereço guardado junto diz de qual item a foto é: trocando de item, a
  // anterior não pode aparecer no lugar da nova enquanto ela não chega.
  if (settled?.url !== url) return { image: null, loading: true };

  return { image: settled.image, loading: false };
}
