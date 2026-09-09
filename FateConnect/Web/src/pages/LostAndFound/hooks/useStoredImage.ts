import { useEffect, useState } from 'react';

import { fetchStoredImage } from '@app/services/lostAndFound/lostAndFoundService';

type StoredImage = { url: string; objectUrl: string };

/** Endereço que o navegador possa exibir, buscado com o token e revogado ao sair. */
export function useStoredImage(url: string | null): string | null {
  const [loaded, setLoaded] = useState<StoredImage | null>(null);

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

        setLoaded({ url: imageUrl, objectUrl: created });
      } catch {
        // Sem a foto o cartão fica com o lugar dela, do mesmo tamanho.
        setLoaded(null);
      }
    }

    void load(url);

    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [url]);

  if (url === null || loaded === null) return null;

  // O endereço guardado junto diz de qual item a foto é: trocando de item, a
  // anterior não pode aparecer no lugar da nova enquanto ela não chega.
  if (loaded.url !== url) return null;

  return loaded.objectUrl;
}
