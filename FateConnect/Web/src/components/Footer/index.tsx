import { APP_CONTACT } from '@app/constants/appContact';
import { LandingSection } from '@app/routes/paths';
import { EmailIcon, LocationOnIcon, PhoneIcon, Typography } from '@design-system';
import {
  ContactItem,
  ContactsContainer,
  CopyrightContainer,
  FooterDivider,
  FooterRoot,
} from './styles';

export function Footer() {
  return (
    <FooterRoot>
      <ContactsContainer id={LandingSection.CONTACT}>
        <Typography variant="h2">Entre em contato</Typography>

        <ContactItem>
          <EmailIcon fontSize="small" />
          <Typography variant="caption">{APP_CONTACT.email}</Typography>
        </ContactItem>
        <ContactItem>
          <PhoneIcon fontSize="small" />
          <Typography variant="caption">{APP_CONTACT.phone}</Typography>
        </ContactItem>
        <ContactItem>
          <LocationOnIcon fontSize="small" />
          <Typography variant="caption">{APP_CONTACT.address}</Typography>
        </ContactItem>
      </ContactsContainer>

      <FooterDivider />

      <CopyrightContainer>
        <Typography variant="caption">© 2026 FateConnect. Todos os direitos reservados.</Typography>
        <Typography variant="caption">Desenvolvido para facilitar a vida do Fatecano.</Typography>
      </CopyrightContainer>
    </FooterRoot>
  );
}
