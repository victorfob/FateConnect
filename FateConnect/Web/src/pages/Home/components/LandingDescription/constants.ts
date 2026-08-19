import {
  DirectionsCarIcon,
  GroupsIcon,
  SearchIcon,
  SecurityIcon,
  type SvgIconComponent,
} from '@design-system';

export type DescriptionHighlight = { label: string; Icon: SvgIconComponent };

export const DESCRIPTION_HIGHLIGHTS: DescriptionHighlight[] = [
  { label: 'Caronas Seguras', Icon: DirectionsCarIcon },
  { label: 'Achados & Perdidos', Icon: SearchIcon },
  { label: 'Portal de Denúncias', Icon: SecurityIcon },
  { label: 'Comunidade Verificada', Icon: GroupsIcon },
];

export const DESCRIPTION_TITLE = 'Conectando a Comunidade Acadêmica';

export const DESCRIPTION_LEAD =
  'Facilite sua vida na Fatec Sorocaba: encontre caronas, recupere pertences, registre denúncias e interaja com outros estudantes com total praticidade e segurança.';
