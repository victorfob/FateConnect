import {
  DirectionsCarIcon,
  GroupsIcon,
  SearchIcon,
  SecurityIcon,
  type SvgIconComponent,
} from '@design-system/icons';

export type ServiceCard = { title: string; description: string; Icon: SvgIconComponent };

export const SERVICES_TITLE = 'Nossos Serviços';

export const SERVICE_CARDS: ServiceCard[] = [
  {
    title: 'Caronas Universitárias',
    description:
      'Encontre ou ofereça caronas para outros estudantes da Fatec. Economize dinheiro e faça novos amigos no caminho.',
    Icon: DirectionsCarIcon,
  },
  {
    title: 'Achados & Perdidos',
    description:
      'Perdeu algo no campus? Encontre seu objeto de volta de maneira fácil e rápida com a nossa plataforma!',
    Icon: SearchIcon,
  },
  {
    title: 'Comunidade Verificada',
    description:
      'Todos os usuários são verificados através do e-mail institucional, garantindo que você interaja apenas com membros da comunidade acadêmica.',
    Icon: GroupsIcon,
  },
  {
    title: 'Portal de Denúncias',
    description:
      'Relate situações inadequadas, assédio, bullying ou qualquer comportamento impróprio de forma anônima e segura. Sua denúncia será tratada com total confidencialidade.',
    Icon: SecurityIcon,
  },
];
