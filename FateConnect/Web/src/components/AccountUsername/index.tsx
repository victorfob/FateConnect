import * as S from './styles';

type AccountUsernameProps = Readonly<{ email: string }>;

/** Formulário com senha leva o login marcado, senão o gerenciador de senhas o põe no campo anterior. */
export function AccountUsername({ email }: AccountUsernameProps) {
  return (
    <S.AccountUsername
      component="input"
      type="email"
      autoComplete="username"
      value={email}
      readOnly
    />
  );
}
