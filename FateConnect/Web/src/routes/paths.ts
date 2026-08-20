/**
 * Caminhos das rotas, em **pt-BR**. Trocar um segmento quebra link que o
 * usuário salvou.
 */
export enum RoutePathEnum {
  ROOT = '/',
  LANDING = '/inicio',
  SIGNUP = '/cadastro',
  MENU = '/menu',
  LOST_AND_FOUND = '/achados-perdidos',
  RIDES = '/caronas',
  RIDES_SEARCH = '/caronas/buscar',
  RIDES_OFFER = '/caronas/ofertar',
}

/** Fragmentos das seções da landing, usados na navegação por âncora. */
export enum LandingSectionEnum {
  SERVICES = 'servicos',
  HOW_IT_WORKS = 'como-funciona',
  CONTACT = 'contato',
  LOGIN = 'login',
}
