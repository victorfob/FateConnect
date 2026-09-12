import { RoutePathEnum } from './paths';

export type PageMetadata = Readonly<{
  title: string;
  /** Só as rotas públicas: as demais ficam atrás do guard e nenhum robô as alcança. */
  description?: string;
  canonical?: string;
}>;

const SITE_NAME = 'FateConnect';

/** Separador que o guia do Google nomeia, ao lado do hífen e dos dois-pontos. */
const TITLE_SEPARATOR = ' | ';

function titleFor(screen: string): string {
  return `${screen}${TITLE_SEPARATOR}${SITE_NAME}`;
}

const LANDING_METADATA: PageMetadata = {
  title: `${SITE_NAME}${TITLE_SEPARATOR}Caronas e achados e perdidos da Fatec`,
  description:
    'Caronas entre quem estuda na Fatec Sorocaba e um mural de achados e perdidos. Ofereça uma vaga no seu trajeto ou encontre quem faz o mesmo caminho.',
  // Relativa de propósito: o endereço de cada ambiente fica fora do repositório,
  // e a raiz serve este mesmo documento sem redirecionar no servidor.
  canonical: RoutePathEnum.LANDING,
};

/**
 * ⛔ O metadado é da **rota**, não da tela: `/perfil`, `/denuncias` e
 * `/notificacoes` ainda renderizam o mesmo marcador, e o título precisa
 * distingui-las. Trocar o marcador pela tela real não pode perder o título.
 */
export const PAGE_METADATA: Record<RoutePathEnum, PageMetadata> = {
  // A raiz só redireciona; herda a landing para não piscar outro título antes.
  [RoutePathEnum.ROOT]: LANDING_METADATA,
  [RoutePathEnum.LANDING]: LANDING_METADATA,
  [RoutePathEnum.SIGNUP]: {
    title: titleFor('Criar conta'),
    description:
      'Crie sua conta com o e-mail institucional da Fatec para oferecer caronas, pegar carona e cadastrar itens perdidos no campus.',
  },
  [RoutePathEnum.MENU]: { title: titleFor('Menu') },
  [RoutePathEnum.LOST_AND_FOUND]: { title: titleFor('Achados & Perdidos') },
  [RoutePathEnum.RIDES]: { title: titleFor('Caronas') },
  [RoutePathEnum.PREFERENCES]: { title: titleFor('Preferências') },
  [RoutePathEnum.PROFILE]: { title: titleFor('Meu perfil') },
  [RoutePathEnum.DENUNCIATIONS]: { title: titleFor('Denúncias') },
  [RoutePathEnum.NOTIFICATIONS]: { title: titleFor('Notificações') },
};

export function isKnownRoute(path: string): path is RoutePathEnum {
  return path in PAGE_METADATA;
}
