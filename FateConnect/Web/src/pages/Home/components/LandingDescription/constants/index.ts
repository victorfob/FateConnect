import {
  DirectionsCarIcon,
  GroupsIcon,
  SearchIcon,
  SecurityIcon,
  type SvgIconComponent,
} from '@design-system/icons';

export type DescriptionHighlight = { label: string; Icon: SvgIconComponent };

export const DESCRIPTION_HIGHLIGHTS: DescriptionHighlight[] = [
  { label: 'Caronas seguras', Icon: DirectionsCarIcon },
  { label: 'Achados & Perdidos', Icon: SearchIcon },
  { label: 'Portal de denúncias', Icon: SecurityIcon },
  { label: 'Comunidade verificada', Icon: GroupsIcon },
];

export const HIGHLIGHT_LIST_LABEL = 'Destaques do FateConnect';

export const DESCRIPTION_TITLE = 'Caronas, achados e perdidos e denúncias em um lugar só';

export const DESCRIPTION_LEAD =
  'Entre com o e-mail institucional da Fatec Sorocaba e use os serviços com quem estuda com você.';
