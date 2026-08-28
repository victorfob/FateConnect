import { Typography } from '@design-system';

import * as C from './constants';
import * as S from './styles';

/** Os documentos no rodapé: o único caminho para quem já tem conta. */
export function LegalFooterLinks() {
  return (
    <S.LinksRow>
      {C.LEGAL_FOOTER_LINKS.map(({ label, url }) => (
        <S.DocumentLink key={url} component="a" href={url} target="_blank" rel="noreferrer">
          <Typography variant="caption" color="inherit">
            {label}
          </Typography>
        </S.DocumentLink>
      ))}
    </S.LinksRow>
  );
}
