import type SvgIcon from '@mui/material/SvgIcon';

import type { FeedbackTone } from '@ds-root/theme/types';

import { TONE_ICONS } from './constants';
import * as S from './styles';

export type FeedbackIconProps = Readonly<{
  tone: FeedbackTone;
  /** Troca o ícone padrão do tom, quando o recado tem um símbolo próprio (o cadeado do bloqueio). */
  icon?: typeof SvgIcon;
}>;

/** O ícone é decorativo: quem diz o que aconteceu é o texto ao lado. */
export function FeedbackIcon({ tone, icon }: FeedbackIconProps) {
  const Icon = icon ?? TONE_ICONS[tone];

  return (
    <S.ToneDisc tone={tone} aria-hidden>
      <Icon />
    </S.ToneDisc>
  );
}
