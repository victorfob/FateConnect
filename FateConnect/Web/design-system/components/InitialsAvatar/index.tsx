import type { InitialsAvatarSize } from './types';
import * as S from './styles';

export type InitialsAvatarProps = Readonly<{
  /** Iniciais já derivadas — o design system não conhece regra de nome. */
  initials: string;
  /** O que o leitor de tela anuncia no lugar das iniciais. */
  label: string;
  size?: InitialsAvatarSize;
  /** Com a foto, ela ocupa o círculo; sem ela, ou se não carregar, voltam as iniciais. */
  photoSrc?: string;
  /** Enquanto a foto chega, o círculo pulsa no lugar das iniciais, que piscariam antes dela. */
  loading?: boolean;
}>;

/**
 * Marca de identidade no cromo: círculo na cor de destaque com as iniciais.
 * Anunciado como imagem, porque duas letras soltas não dizem nada em voz alta.
 */
export function InitialsAvatar({
  initials,
  label,
  size = 'small',
  photoSrc,
  loading = false,
}: InitialsAvatarProps) {
  if (loading)
    return (
      <S.LoadingCircle
        variant="circular"
        animation="pulse"
        role="img"
        aria-label={label}
        aria-busy
        size={size}
      />
    );

  return (
    <S.InitialsCircle role="img" aria-label={label} size={size} src={photoSrc} alt="">
      {initials}
    </S.InitialsCircle>
  );
}
