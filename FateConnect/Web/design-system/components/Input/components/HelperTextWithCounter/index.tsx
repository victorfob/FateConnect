import * as S from './styles';

export type HelperTextWithCounterProps = Readonly<{
  error?: string;
  characterCount: number;
  maxLength: number;
}>;

export function HelperTextWithCounter({
  error,
  characterCount,
  maxLength,
}: HelperTextWithCounterProps) {
  return (
    <S.HelperLine component="span">
      <S.HelperMessage component="span">{error}</S.HelperMessage>
      <S.CharacterCounter component="span" aria-hidden>
        {`${characterCount}/${maxLength}`}
      </S.CharacterCounter>
    </S.HelperLine>
  );
}
