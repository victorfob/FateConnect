import type { ReactNode } from 'react';
import Typography from '@mui/material/Typography';

import * as S from './styles';

export type DialogSubmitProps = Readonly<{
  icon: ReactNode;
  label: string;
  loading?: boolean;
  disabled?: boolean;
}>;

export function DialogSubmit({ icon, label, loading, disabled }: DialogSubmitProps) {
  return (
    <S.SubmitButton
      type="submit"
      variant="contained"
      color="secondary"
      fullWidth
      loading={loading}
      disabled={disabled}
    >
      {icon}
      <Typography variant="subtitleBold" color="inherit">
        {label}
      </Typography>
    </S.SubmitButton>
  );
}
