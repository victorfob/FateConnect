import type { ReactNode } from 'react';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import Typography from '@mui/material/Typography';

import { UnderlinedLink } from '../UnderlinedLink';
import * as S from './styles';

export type FooterContact = Readonly<{
  label: string;
  href: string;
  accessibleLabel: string;
}>;

type FooterProps = Readonly<{
  /** Id da âncora usada pela navegação da aplicação. */
  anchorId: string;
  title: string;
  /** O destino de cada linha é montado pela aplicação: o design system não conhece
   * o código do país nem o provedor de mapa. */
  contact: Readonly<{ email: FooterContact; phone: FooterContact; address: FooterContact }>;
  copyrightLines: string[];
  /** Links institucionais, montados pela aplicação — o design system não conhece rotas. */
  links?: ReactNode;
}>;

export function Footer({ anchorId, title, contact, copyrightLines, links }: FooterProps) {
  return (
    <S.FooterRoot component="footer">
      <S.ContactsContainer id={anchorId}>
        <Typography variant="h2">{title}</Typography>

        <UnderlinedLink
          href={contact.email.href}
          accessibleLabel={contact.email.accessibleLabel}
          icon={<EmailIcon fontSize="small" />}
        >
          <Typography variant="caption">{contact.email.label}</Typography>
        </UnderlinedLink>

        <UnderlinedLink
          href={contact.phone.href}
          accessibleLabel={contact.phone.accessibleLabel}
          icon={<PhoneIcon fontSize="small" />}
        >
          <Typography variant="caption">{contact.phone.label}</Typography>
        </UnderlinedLink>

        <UnderlinedLink
          href={contact.address.href}
          accessibleLabel={contact.address.accessibleLabel}
          icon={<LocationOnIcon fontSize="small" />}
          opensInNewTab
        >
          <Typography variant="caption">{contact.address.label}</Typography>
        </UnderlinedLink>
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
