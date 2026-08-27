import type { ReactNode } from 'react';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import Typography from '@mui/material/Typography';

import * as S from './styles';

type FooterProps = Readonly<{
  /** Id da âncora usada pela navegação da aplicação. */
  anchorId: string;
  title: string;
  contact: { email: string; phone: string; address: string };
  copyrightLines: string[];
  /** Links institucionais, montados pela aplicação — o design system não conhece rotas. */
  links?: ReactNode;
}>;

export function Footer({ anchorId, title, contact, copyrightLines, links }: FooterProps) {
  return (
    <S.FooterRoot component="footer">
      <S.ContactsContainer id={anchorId}>
        <Typography variant="h2">{title}</Typography>

        <S.ContactItem>
          <EmailIcon fontSize="small" />
          <Typography variant="caption">{contact.email}</Typography>
        </S.ContactItem>
        <S.ContactItem>
          <PhoneIcon fontSize="small" />
          <Typography variant="caption">{contact.phone}</Typography>
        </S.ContactItem>
        <S.ContactItem>
          <LocationOnIcon fontSize="small" />
          <Typography variant="caption">{contact.address}</Typography>
        </S.ContactItem>
      </S.ContactsContainer>

      <S.FooterDivider />

      <S.CopyrightContainer>
        {copyrightLines.map((line) => (
          <Typography key={line} variant="caption">
            {line}
          </Typography>
        ))}

        {links}
      </S.CopyrightContainer>
    </S.FooterRoot>
  );
}
