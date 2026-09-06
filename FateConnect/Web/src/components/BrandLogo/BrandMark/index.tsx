import type { BrandMarkToneEnum } from './@types';
import BrandMarkArt from './assets/brand-mark.svg?react';
import * as S from './styles';

type BrandMarkProps = Readonly<{ tone: BrandMarkToneEnum }>;

/** O símbolo da marca. Quem o contém é que carrega o nome acessível. */
export function BrandMark({ tone }: BrandMarkProps) {
  return (
    <S.MarkRoot component="span" tone={tone}>
      <BrandMarkArt aria-hidden focusable="false" />
    </S.MarkRoot>
  );
}
