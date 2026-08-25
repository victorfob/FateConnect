import { ImageIcon } from '@design-system/icons';

import * as C from '../constants';
import * as S from './styles';

type LostItemPhotoProps = Readonly<{ url: string | null; itemName: string }>;

export function LostItemPhoto({ url, itemName }: LostItemPhotoProps) {
  if (url === null)
    return (
      <S.PhotoPlaceholder aria-hidden>
        <ImageIcon />
      </S.PhotoPlaceholder>
    );

  return <S.Photo component="img" src={url} alt={C.photoAlt(itemName)} />;
}
