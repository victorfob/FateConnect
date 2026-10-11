import { useId, type ReactNode } from 'react';
import { Typography } from '@design-system';

import * as S from './styles';

type AuthCardProps = Readonly<{ title: string; description?: string; children: ReactNode }>;

export function AuthCard({ title, description, children }: AuthCardProps) {
  const titleId = useId();

  return (
    <S.CardRoot component="article" aria-labelledby={titleId}>
      <S.CardTitle>
        <Typography variant="h2" id={titleId}>
          {title}
        </Typography>
        {description && <Typography variant="body">{description}</Typography>}
      </S.CardTitle>

      {children}
    </S.CardRoot>
  );
}

AuthCard.Page = S.PageRoot;
AuthCard.Form = S.Form;
AuthCard.Submit = S.SubmitRow;
AuthCard.Prompt = S.PromptRow;
