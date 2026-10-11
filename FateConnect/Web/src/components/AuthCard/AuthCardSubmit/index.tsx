import type { ReactNode } from 'react';
import { Button } from '@design-system';

import * as S from './styles';

type AuthCardSubmitProps = Readonly<{ loading: boolean; children: ReactNode }>;

export function AuthCardSubmit({ loading, children }: AuthCardSubmitProps) {
  return (
    <S.SubmitRow>
      <Button type="submit" variant="contained" color="secondary" loading={loading}>
        {children}
      </Button>
    </S.SubmitRow>
  );
}
