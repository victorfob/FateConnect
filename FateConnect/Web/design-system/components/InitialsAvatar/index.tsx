import type { InitialsAvatarSize } from './types';
import * as S from './styles';

export type InitialsAvatarProps = Readonly<{
  /** Iniciais já derivadas — o design system não conhece regra de nome. */
  initials: string;
  /** O que o leitor de tela anuncia no lugar das iniciais. */
  label: string;
  size?: InitialsAvatarSize;
}>;

/**
 * Marca de identidade no cromo: círculo na cor de destaque com as iniciais.
 * Anunciado como imagem, porque duas letras soltas não dizem nada em voz alta.
 */
export function InitialsAvatar({ initials, label, size = 'small' }: InitialsAvatarProps) {
  return (
    <S.InitialsCircle role="img" aria-label={label} size={size}>
      {initials}
    </S.InitialsCircle>
  );
}
