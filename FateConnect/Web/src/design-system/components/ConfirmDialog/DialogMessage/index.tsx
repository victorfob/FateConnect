import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export type DialogMessageProps = Readonly<{
  /** Trecho em destaque no meio da frase — o nome do que será removido. */
  emphasis?: string;
  prefix?: string;
  suffix?: string;
  /** Mensagem inteira, quando não há trecho em destaque. */
  children?: ReactNode;
}>;

/**
 * Corpo da confirmação. Com `emphasis`, a frase é montada em três partes para
 * o nome do item aparecer em destaque no meio dela.
 */
export function DialogMessage({ emphasis, prefix, suffix, children }: DialogMessageProps) {
  if (emphasis) {
    return (
      <Typography variant="subtitle">
        {prefix}
        <strong>{emphasis}</strong>
        {suffix}
      </Typography>
    );
  }

  return <Typography variant="subtitle">{children}</Typography>;
}
