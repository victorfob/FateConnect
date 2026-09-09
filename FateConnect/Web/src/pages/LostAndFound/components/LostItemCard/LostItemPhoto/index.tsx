import { ImageIcon } from '@design-system/icons';

import { useStoredImage } from '@app/pages/LostAndFound/hooks/useStoredImage';

import * as C from '../constants';
import * as S from './styles';

export type LostItemPhotoProps = Readonly<{ url: string | null; itemName: string }>;

export function LostItemPhoto({ url, itemName }: LostItemPhotoProps) {
  const source = useStoredImage(url);

  if (source === null)
    return (
      <S.PhotoPlaceholder aria-hidden>
        <ImageIcon />
      </S.PhotoPlaceholder>
    );

  return <S.Photo component="img" src={source} alt={C.photoAlt(itemName)} />;
}
