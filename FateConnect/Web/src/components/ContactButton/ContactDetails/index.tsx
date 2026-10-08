import { Typography } from '@design-system';
import { EmailIcon, PhoneIcon } from '@design-system/icons';

import { mailtoUrl } from '@app/utils/contactLinks';

import { ContactAvatar } from './ContactAvatar';
import { ContactChannel } from './ContactChannel';
import * as C from './constants';
import * as S from './styles';

export type ContactDetailsProps = Readonly<{
  name: string;
  initials: string;
  /** Miniatura da foto de perfil; sem ela, as iniciais. */
  thumbnailUrl: string | null;
  /** Sem ele, o canal não aparece. */
  email: string | null;
  /** Telefone como aparece em tela; sem ele, o canal não aparece. */
  phone: string | null;
  /**
   * Destino do link do telefone. Vem de fora porque para onde ele leva é decisão
   * de produto — conversa em aplicativo, chamada.
   */
  phoneHref: string | null;
}>;

/**
 * Vias de contato de uma pessoa: identidade de um lado, canais clicáveis do
 * outro, centralizados no espaço que receberem e empilhados no estreito. Não
 * sabe onde está sendo mostrado — cabe num diálogo, num cartão ou num painel.
 */
export function ContactDetails({
  name,
  initials,
  thumbnailUrl,
  email,
  phone,
  phoneHref,
}: ContactDetailsProps) {
  return (
    <S.DetailsRow>
      <S.Identity>
        <ContactAvatar name={name} initials={initials} thumbnailUrl={thumbnailUrl} />
        <Typography variant="subtitleBold">{name}</Typography>
      </S.Identity>

      <S.Channels>
        {email && (
          <ContactChannel
            href={mailtoUrl(email)}
            accessibleLabel={C.sendEmailLabel(email)}
            icon={<EmailIcon />}
          >
            {email}
          </ContactChannel>
        )}

        {phone && phoneHref && (
          <ContactChannel href={phoneHref} icon={<PhoneIcon />} opensInNewTab>
            {phone}
          </ContactChannel>
        )}
      </S.Channels>
    </S.DetailsRow>
  );
}
