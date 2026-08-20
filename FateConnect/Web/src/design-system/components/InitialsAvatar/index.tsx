import * as S from './styles';

type InitialsAvatarProps = Readonly<{
  /** Iniciais já derivadas — o design system não conhece regra de nome. */
  initials: string;
  /** O que o leitor de tela anuncia no lugar das iniciais. */
  label: string;
}>;

/**
 * Marca de identidade no cromo: círculo na cor de destaque com as iniciais.
 * Anunciado como imagem, porque duas letras soltas não dizem nada em voz alta.
 */
export function InitialsAvatar({ initials, label }: InitialsAvatarProps) {
  return (
    <S.InitialsCircle role="img" aria-label={label}>
      {initials}
    </S.InitialsCircle>
  );
}
