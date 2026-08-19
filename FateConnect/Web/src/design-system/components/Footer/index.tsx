import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import Typography from '@mui/material/Typography';

import {
  ContactItem,
  ContactsContainer,
  CopyrightContainer,
  FooterDivider,
  FooterRoot,
} from './styles';

type FooterProps = {
  /** Id da âncora usada pela navegação da aplicação. */
  anchorId: string;
  title: string;
  contact: { email: string; phone: string; address: string };
  copyrightLines: string[];
};

export function Footer({ anchorId, title, contact, copyrightLines }: FooterProps) {
  return (
    <FooterRoot>
      <ContactsContainer id={anchorId}>
        <Typography variant="h2">{title}</Typography>

        <ContactItem>
          <EmailIcon fontSize="small" />
          <Typography variant="caption">{contact.email}</Typography>
        </ContactItem>
        <ContactItem>
          <PhoneIcon fontSize="small" />
          <Typography variant="caption">{contact.phone}</Typography>
        </ContactItem>
        <ContactItem>
          <LocationOnIcon fontSize="small" />
          <Typography variant="caption">{contact.address}</Typography>
        </ContactItem>
      </ContactsContainer>

      <FooterDivider />

      <CopyrightContainer>
        {copyrightLines.map((line) => (
          <Typography key={line} variant="caption">
            {line}
          </Typography>
        ))}
      </CopyrightContainer>
    </FooterRoot>
  );
}
