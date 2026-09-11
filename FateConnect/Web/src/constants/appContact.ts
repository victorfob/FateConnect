import { mailtoUrl, telUrl } from '@app/utils/contactLinks';

const EMAIL = 'f003alunos@cps.sp.gov.br';
const PHONE = '(15) 3238-5266';
const ADDRESS = 'Av. Eng. Carlos Reinaldo Mendes, 2015';

/**
 * Quem identifica o campus é o trecho `data=`; sem ele o Maps cai nas
 * coordenadas e perde a ficha do lugar, medido em 11/09/2026. Os parâmetros
 * `entry` e `g_ep` da URL original saíram: são rastreio e carimbo de build.
 */
const MAP_URL =
  'https://www.google.com/maps/place/Fatec+Sorocaba+-+Faculdade+de+Tecnologia+de+Sorocaba/@-23.4806626,-47.4265607,17z/data=!4m15!1m8!3m7!1s0x94cf6073acd0d3ef:0x71b427bcbe698ab5!2sAv.+Eng.+Carlos+Reinaldo+Mendes,+2015+-+Al%C3%A9m+Ponte,+Sorocaba+-+SP,+18013-280!3b1!8m2!3d-23.4806626!4d-47.4265607!16s%2Fg%2F11c16_8s_h!3m5!1s0x94cf606d86294f07:0xd78b8fde607352a4!8m2!3d-23.4805389!4d-47.4259652!16s%2Fg%2F120k19gp';

/** Dados de contato institucionais, exibidos no rodapé e na seção `#contato` da landing. */
export const APP_CONTACT = {
  email: {
    label: EMAIL,
    href: mailtoUrl(EMAIL),
    accessibleLabel: `Enviar e-mail para ${EMAIL}`,
  },
  phone: {
    label: PHONE,
    href: telUrl(PHONE),
    accessibleLabel: `Ligar para ${PHONE}`,
  },
  address: {
    label: ADDRESS,
    href: MAP_URL,
    accessibleLabel: `Abrir ${ADDRESS} no mapa`,
  },
};

export const FOOTER_TITLE = 'Entre em contato';

export const FOOTER_COPYRIGHT_LINES = [
  '© 2026 FateConnect. Todos os direitos reservados.',
  'Desenvolvido para facilitar a vida de quem estuda na Fatec.',
];
