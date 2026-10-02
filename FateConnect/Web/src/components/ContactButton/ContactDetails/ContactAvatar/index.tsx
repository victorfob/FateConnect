import { InitialsAvatar } from '@design-system';

import { useStoredImage } from '@app/hooks/useStoredImage';

type ContactAvatarProps = Readonly<{ name: string; initials: string; thumbnailUrl: string | null }>;

/** Só monta com o contato à vista: a foto se baixa quando alguém o abre, não ao listar os cartões. */
export function ContactAvatar({ name, initials, thumbnailUrl }: ContactAvatarProps) {
  const { image, loading } = useStoredImage(thumbnailUrl);

  return (
    <InitialsAvatar
      initials={initials}
      label={name}
      size="large"
      photoSrc={image?.objectUrl}
      loading={loading}
    />
  );
}
