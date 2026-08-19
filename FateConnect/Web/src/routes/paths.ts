/**
 * Caminhos das rotas. Permanecem em **pt-BR e idênticos** aos do front Angular:
 * trocar um segmento quebra link salvo pelo usuário.
 */
export enum RoutePath {
  ROOT = '/',
  LANDING = '/inicio',
  SIGNUP = '/cadastro',
  MENU = '/menu',
  LOST_AND_FOUND = '/achados-perdidos',
  CONTACT = '/contato',
  RIDES = '/caronas',
  RIDES_SEARCH = '/caronas/buscar',
  RIDES_OFFER = '/caronas/ofertar',
}

/** Fragmentos das seções da landing, usados na navegação por âncora. */
export enum LandingSection {
  SERVICES = 'servicos',
  HOW_IT_WORKS = 'como-funciona',
  CONTACT = 'contato',
  LOGIN = 'login',
}
