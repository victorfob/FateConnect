import type { ReactNode } from 'react';

import { INFO_ROW_ATTRIBUTE } from '@ds-root/components/ListCard/constants';

import * as S from './styles';

export type ListCardInfoRowProps = Readonly<{ children: ReactNode }>;

/** A fileira de `ListCard.InfoItem`, em linha no desktop e em coluna no estreito. */
export function ListCardInfoRow({ children }: ListCardInfoRowProps) {
  return <S.InfoRow {...{ [INFO_ROW_ATTRIBUTE]: '' }}>{children}</S.InfoRow>;
}
