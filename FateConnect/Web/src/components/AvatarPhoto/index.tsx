import { InitialsAvatar, type InitialsAvatarProps } from '@design-system';

import { PhotoViewer } from '@app/components/PhotoViewer';
import type { PhotoSource } from '@app/components/PhotoViewer/@types/photoSource';

import * as C from './constants';

export type AvatarPhotoProps = InitialsAvatarProps &
  Readonly<{
    /** De onde vem a foto inteira. Sem ela, ou sem foto à vista, o avatar não abre nada. */
    source: PhotoSource | null;
  }>;

export function AvatarPhoto({ source, ...avatarProps }: AvatarPhotoProps) {
  if (!source || !avatarProps.photoSrc) return <InitialsAvatar {...avatarProps} />;

  return (
    <PhotoViewer
      title={avatarProps.label}
      alt={C.photoAlt(avatarProps.label)}
      source={source}
      shape="circle"
    >
      <InitialsAvatar {...avatarProps} />
    </PhotoViewer>
  );
}
