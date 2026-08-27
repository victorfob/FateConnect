import { InitialsAvatar, Typography } from '@design-system';
import { EmailIcon, PhoneIcon } from '@design-system/icons';

import { ContactChannel } from './ContactChannel';
import * as S from './styles';

/** Prefixo do nome acessível do e-mail — o texto visível vem depois dele. */
const COPY_EMAIL_LABEL = 'Copiar';

export type ContactDetailsProps = Readonly<{
  name: string;
  initials: string;
  email: string;
  /** Telefone como aparece em tela. */
  phone: string;
  /**
   * Destino do link do telefone. Vem de fora porque para onde ele leva é decisão
   * de produto — conversa em aplicativo, chamada.
   */
  phoneHref: string;
  /** O que acontece ao acionar o e-mail. Quem compõe copia e avisa. */
  onCopyEmail: VoidFunction;
}>;

/**
 * Vias de contato de uma pessoa: identidade de um lado, canais clicáveis do
 * outro, centralizados no espaço que receberem e empilhados no estreito. Não
 * sabe onde está sendo mostrado — cabe num diálogo, num cartão ou num painel.
 */
export function ContactDetails({
  name,
  initials,
  email,
  phone,
  phoneHref,
  onCopyEmail,
}: ContactDetailsProps) {
  return (
    <S.DetailsRow>
      <S.Identity>
        <InitialsAvatar initials={initials} label={name} size="large" />
        <Typography variant="subtitleBold">{name}</Typography>
      </S.Identity>

      <S.Channels>
        <ContactChannel
          onClick={onCopyEmail}
          label={`${COPY_EMAIL_LABEL} ${email}`}
          icon={<EmailIcon />}
        >
          {email}
        </ContactChannel>

        <ContactChannel href={phoneHref} icon={<PhoneIcon />}>
          {phone}
        </ContactChannel>
      </S.Channels>
    </S.DetailsRow>
  );
}
