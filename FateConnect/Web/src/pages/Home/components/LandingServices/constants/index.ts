import {
  DirectionsCarIcon,
  GroupsIcon,
  SearchIcon,
  SecurityIcon,
  type SvgIconComponent,
} from '@design-system/icons';

export type ServiceCard = { title: string; description: string; Icon: SvgIconComponent };

export const SERVICES_TITLE = 'Nossos serviços';

export const SERVICE_CARDS: ServiceCard[] = [
  {
    title: 'Caronas universitárias',
    description:
      'Ofereça uma vaga no seu trajeto ou pegue carona com quem faz o mesmo caminho, dividindo o custo ou de graça.',
    Icon: DirectionsCarIcon,
  },
  {
    title: 'Achados & Perdidos',
    description:
      'Cadastre o que perdeu ou o que achou no campus e receba o contato de quem procura.',
    Icon: SearchIcon,
  },
  {
    title: 'Comunidade verificada',
    description:
      'Só entra quem tem e-mail @aluno.cps.sp.gov.br ou @cps.sp.gov.br: do outro lado há sempre alguém da Fatec.',
    Icon: GroupsIcon,
  },
  {
    title: 'Portal de denúncias',
    description: 'Relate assédio, bullying ou conduta imprópria sem se identificar.',
    Icon: SecurityIcon,
  },
];
